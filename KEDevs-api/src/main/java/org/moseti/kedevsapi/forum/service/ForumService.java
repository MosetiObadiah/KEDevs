package org.moseti.kedevsapi.forum.service;

import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.forum.dto.ForumDtos.*;
import org.moseti.kedevsapi.forum.entity.CommentFlag;
import org.moseti.kedevsapi.forum.entity.CommentVote;
import org.moseti.kedevsapi.forum.entity.ForumComment;
import org.moseti.kedevsapi.forum.exception.*;
import org.moseti.kedevsapi.forum.repository.CommentFlagRepository;
import org.moseti.kedevsapi.forum.repository.CommentVoteRepository;
import org.moseti.kedevsapi.forum.repository.ForumCommentRepository;
import org.moseti.kedevsapi.jobs.entity.JobPost;
import org.moseti.kedevsapi.jobs.repository.JobPostRepository;
import org.moseti.kedevsapi.shared.enums.JobStatus;
import org.moseti.kedevsapi.shared.enums.VoteType;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.shared.util.Constants;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.moseti.kedevsapi.shared.dto.WebSocketEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumCommentRepository commentRepository;
    private final CommentVoteRepository voteRepository;
    private final CommentFlagRepository flagRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final org.moseti.kedevsapi.shared.service.SettingService settingService;
    private final org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    private final org.moseti.kedevsapi.jobs.repository.JobApplicationRepository jobApplicationRepository;

    private void pushForumEvent(UUID jobId, String type, Object data) {
        messagingTemplate.convertAndSend("/topic/forum/" + jobId, new WebSocketEvent<>(type, data));
    }

    @Transactional
    public CommentResponse addComment(UUID userId, UUID jobId, AddCommentRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        if (job.getStatus() == JobStatus.REMOVED) {
            throw new BadRequestException("Cannot comment on a removed job post");
        }

        ForumComment comment = new ForumComment();
        comment.setJobId(jobId);
        comment.setAuthorId(userId);
        comment.setParentCommentId(null);
        comment.setContent(request.content());

        ForumComment saved = commentRepository.save(comment);

        // Batch-load the author name for this single comment (only 1 user lookup)
        Map<UUID, User> userMap = loadUserMap(Set.of(userId));
        CommentResponse response = toCommentResponse(saved, userId, false, userMap, Set.of());
        pushForumEvent(jobId, "NEW_COMMENT", response);

        // Notify job poster if commenter != job poster
        if (!userId.equals(job.getPostedById())) {
            notificationService.notify(
                job.getPostedById(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.FORUM,
                "New Comment on Job",
                resolveAuthorName(userId, userMap) + " commented on your job \"" + job.getTitle() + "\".",
                "{\"jobId\":\"" + jobId + "\",\"commentId\":\"" + saved.getId() + "\"}"
            );
        }

        return response;
    }

    @Transactional
    public CommentResponse addReply(UUID userId, UUID jobId, AddReplyRequest request) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        if (job.getStatus() == JobStatus.REMOVED) {
            throw new BadRequestException("Cannot reply on a removed job post");
        }

        ForumComment parentComment = commentRepository.findById(request.parentCommentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));

        if (parentComment.getParentCommentId() != null) {
            throw new CannotReplyToReplyException("Cannot reply to a reply. 2-level threading only.");
        }

        if (!parentComment.getJobId().equals(jobId)) {
            throw new BadRequestException("Parent comment does not belong to this job post");
        }

        ForumComment reply = new ForumComment();
        reply.setJobId(jobId);
        reply.setAuthorId(userId);
        reply.setParentCommentId(request.parentCommentId());
        reply.setContent(request.content());

        ForumComment saved = commentRepository.save(reply);

        // Batch-load the two relevant users (replier + parent author) in one query
        Set<UUID> authorIds = Set.of(userId);
        if (parentComment.getAuthorId() != null) {
            authorIds = new java.util.HashSet<>(authorIds);
            authorIds.add(parentComment.getAuthorId());
        }
        Map<UUID, User> userMap = loadUserMap(authorIds);

        CommentResponse response = toCommentResponse(saved, userId, false, userMap, Set.of());
        pushForumEvent(jobId, "NEW_REPLY", response);

        // Notify parent comment author if replier != parent author
        if (parentComment.getAuthorId() != null && !userId.equals(parentComment.getAuthorId())) {
            notificationService.notify(
                parentComment.getAuthorId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.FORUM,
                "New Reply to Comment",
                resolveAuthorName(userId, userMap) + " replied to your comment.",
                "{\"jobId\":\"" + jobId + "\",\"commentId\":\"" + saved.getId() + "\",\"parentId\":\"" + parentComment.getId() + "\"}"
            );
        }

        // Notify job poster if replier != job poster AND parent author != job poster (deduplication)
        if (!userId.equals(job.getPostedById()) && !job.getPostedById().equals(parentComment.getAuthorId())) {
            notificationService.notify(
                job.getPostedById(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.FORUM,
                "New Activity on Job",
                resolveAuthorName(userId, userMap) + " replied on your job \"" + job.getTitle() + "\".",
                "{\"jobId\":\"" + jobId + "\",\"commentId\":\"" + saved.getId() + "\"}"
            );
        }

        return response;
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getJobComments(UUID jobId, String sortBy, UUID currentUserId, Pageable pageable) {
        Page<ForumComment> comments;
        if ("top".equalsIgnoreCase(sortBy)) {
            comments = commentRepository.findByJobIdAndParentCommentIdIsNullAndIsHiddenFalseOrderByUpvoteCountDesc(jobId, pageable);
        } else {
            comments = commentRepository.findByJobIdAndParentCommentIdIsNullAndIsHiddenFalse(jobId, pageable);
        }

        // Batch load all authors on this page (top-level + all their replies) in two queries
        Set<UUID> topLevelAuthorIds = comments.stream()
                .map(ForumComment::getAuthorId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        // Also load reply authors — one extra query per page, not per comment
        List<ForumComment> allReplies = comments.stream()
                .flatMap(c -> commentRepository.findByParentCommentIdAndIsHiddenFalse(c.getId(), Pageable.unpaged()).stream())
                .collect(Collectors.toList());

        Set<UUID> allAuthorIds = new java.util.HashSet<>(topLevelAuthorIds);
        allReplies.stream().map(ForumComment::getAuthorId).filter(id -> id != null).forEach(allAuthorIds::add);

        Map<UUID, User> userMap = loadUserMap(allAuthorIds);

        // One applicant-set query for the entire job — shared across all comment+reply mappings
        Set<UUID> applicantIds = commentRepository.findApplicantIdsByJobId(jobId);

        return comments.map(c -> toCommentResponse(c, currentUserId, true, userMap, applicantIds));
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentReplies(UUID commentId, UUID currentUserId, Pageable pageable) {
        Page<ForumComment> replies = commentRepository.findByParentCommentIdAndIsHiddenFalse(commentId, pageable);

        Set<UUID> authorIds = replies.stream()
                .map(ForumComment::getAuthorId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        Map<UUID, User> userMap = loadUserMap(authorIds);

        // Determine the job ID from the first reply (all share the same jobId)
        Set<UUID> applicantIds = replies.stream().findFirst()
                .map(r -> commentRepository.findApplicantIdsByJobId(r.getJobId()))
                .orElse(Set.of());

        return replies.map(c -> toCommentResponse(c, currentUserId, false, userMap, applicantIds));
    }

    @Transactional
    public CommentResponse editComment(UUID userId, UUID commentId, EditCommentRequest request) {
        ForumComment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found or you are not the author"));

        if (comment.isHidden()) {
            throw new ForbiddenException("Cannot edit a hidden comment");
        }

        int window = settingService.getCommentEditWindow();
        if (LocalDateTime.now().isAfter(comment.getCreatedAt().plusMinutes(window))) {
            throw new CommentEditWindowExpiredException("Edit window has expired. Comments can only be edited within " + window + " minutes of posting.");
        }

        comment.setContent(request.content());
        ForumComment saved = commentRepository.save(comment);
        Map<UUID, User> userMap = loadUserMap(userId != null ? Set.of(userId) : Set.of());
        return toCommentResponse(saved, userId, false, userMap, Set.of());
    }

    @Transactional
    public void deleteComment(UUID userId, UUID commentId) {
        ForumComment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found or you are not the author"));

        int window = settingService.getCommentDeleteWindow();
        if (LocalDateTime.now().isAfter(comment.getCreatedAt().plusMinutes(window))) {
            throw new CommentDeleteWindowExpiredException("Delete window has expired. Comments can only be deleted within " + window + " minutes of posting.");
        }

        comment.setContent("[deleted]");
        comment.setAuthorId(null);
        commentRepository.save(comment);
    }

    @Transactional
    public void voteOnComment(UUID userId, UUID commentId, VoteCommentRequest request) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        if (userId.equals(comment.getAuthorId())) {
            throw new CannotVoteOnOwnCommentException("Cannot vote on your own comment");
        }

        VoteType voteType = request.voteType();
        CommentVote vote = voteRepository.findByCommentIdAndUserId(commentId, userId).orElse(null);

        if (vote != null) {
            if (vote.getVoteType() == voteType) {
                voteRepository.delete(vote);
            } else {
                vote.setVoteType(voteType);
                voteRepository.save(vote);
            }
        } else {
            vote = new CommentVote();
            vote.setComment(comment);
            vote.setUserId(userId);
            vote.setVoteType(voteType);
            voteRepository.save(vote);
        }

        int upvotes = voteRepository.countByCommentIdAndVoteType(commentId, VoteType.UPVOTE);
        int downvotes = voteRepository.countByCommentIdAndVoteType(commentId, VoteType.DOWNVOTE);
        comment.setUpvoteCount(upvotes - downvotes);
        commentRepository.save(comment);
        
        pushForumEvent(comment.getJobId(), "VOTE_UPDATE", new VoteUpdate(commentId, comment.getUpvoteCount()));
    }

    public record VoteUpdate(UUID commentId, int upvoteCount) {}

    @Transactional
    public void flagComment(UUID userId, UUID commentId, FlagCommentRequest request) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));

        if (userId.equals(comment.getAuthorId())) {
            throw new CannotFlagOwnCommentException("Cannot flag your own comment");
        }

        if (flagRepository.existsByCommentIdAndFlaggedById(commentId, userId)) {
            throw new AlreadyFlaggedCommentException("You have already flagged this comment");
        }

        CommentFlag flag = new CommentFlag();
        flag.setComment(comment);
        flag.setFlaggedById(userId);
        flag.setReason(request.reason());
        flagRepository.save(flag);

        comment.setFlagged(true);
        commentRepository.save(comment);

        // notify admin via notifications module
    }

    @Transactional
    public void hideComment(UUID adminUserId, UUID commentId) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));
        comment.setHidden(true);
        commentRepository.save(comment);
    }

    @Transactional
    public void unhideComment(UUID adminUserId, UUID commentId) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found"));
        comment.setHidden(false);
        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getUserComments(UUID userId, Pageable pageable) {
        Map<UUID, User> userMap = loadUserMap(Set.of(userId));
        return commentRepository.findByAuthorId(userId, pageable)
                .map(c -> {
                    // Skip hidden comments — return null, caller must handle sparse pages
                    if (c.isHidden()) return null;
                    return toCommentResponse(c, null, false, userMap, Set.of());
                });
    }

    // ============================================================
    // Private helpers
    // ============================================================

    /** Loads a map of UUID → User in one query via findAllById. */
    private Map<UUID, User> loadUserMap(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) return Map.of();
        return userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private String resolveAuthorName(UUID authorId, Map<UUID, User> userMap) {
        if (authorId == null) return "Unknown User";
        User u = userMap.get(authorId);
        return u != null ? u.getFullName() : "Unknown User";
    }

    private String resolveAuthorRole(UUID authorId, UUID jobId, Map<UUID, User> userMap, Set<UUID> applicantIds) {
        if (authorId == null) return "DEVELOPER";
        User u = userMap.get(authorId);
        if (u == null || u.getRole() == null) return "DEVELOPER";
        if (u.getRole() == org.moseti.kedevsapi.shared.enums.Role.DEVELOPER) {
            // Use pre-fetched applicant set — no extra DB query per comment
            return applicantIds.contains(authorId) ? "APPLICANT" : "DEVELOPER";
        }
        return u.getRole().name();
    }

    /**
     * Maps a ForumComment to a CommentResponse.
     * Uses pre-loaded userMap and applicantIds — no per-comment DB queries.
     * When includeRepliesCount is true, replies are sourced from the page already loaded
     * by the caller; this method only maps the replies list that was passed in via the
     * comment's context (resolved inline in getJobComments).
     */
    private CommentResponse toCommentResponse(
            ForumComment comment,
            UUID currentUserId,
            boolean includeRepliesCount,
            Map<UUID, User> userMap,
            Set<UUID> applicantIds
    ) {
        VoteType currentUserVote = null;
        if (currentUserId != null) {
            currentUserVote = voteRepository.findByCommentIdAndUserId(comment.getId(), currentUserId)
                    .map(CommentVote::getVoteType)
                    .orElse(null);
        }

        int replyCount = 0;
        List<CommentResponse> replies = List.of();

        if (includeRepliesCount && comment.getParentCommentId() == null) {
            replyCount = commentRepository.countByParentCommentIdAndIsHiddenFalse(comment.getId());
            // Map replies using the same pre-loaded userMap and applicantIds — no recursive DB calls
            replies = commentRepository.findByParentCommentIdAndIsHiddenFalse(comment.getId(), Pageable.unpaged())
                    .map(r -> toCommentResponse(r, currentUserId, false, userMap, applicantIds))
                    .getContent();
        }

        return new CommentResponse(
                comment.getId(),
                comment.getJobId(),
                comment.getAuthorId(),
                resolveAuthorName(comment.getAuthorId(), userMap),
                resolveAuthorRole(comment.getAuthorId(), comment.getJobId(), userMap, applicantIds),
                comment.getParentCommentId(),
                comment.getContent(),
                comment.getUpvoteCount(),
                comment.isHidden(),
                comment.isFlagged(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replyCount,
                currentUserVote,
                replies
        );
    }
}
