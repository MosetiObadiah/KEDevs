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
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumCommentRepository commentRepository;
    private final CommentVoteRepository voteRepository;
    private final CommentFlagRepository flagRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

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
        return toCommentResponse(saved, userId, false);
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
        return toCommentResponse(saved, userId, false);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getJobComments(UUID jobId, String sortBy, UUID currentUserId, Pageable pageable) {
        Page<ForumComment> comments;
        if ("top".equalsIgnoreCase(sortBy)) {
            comments = commentRepository.findByJobIdAndParentCommentIdIsNullAndIsHiddenFalseOrderByUpvoteCountDesc(jobId, pageable);
        } else {
            comments = commentRepository.findByJobIdAndParentCommentIdIsNullAndIsHiddenFalse(jobId, pageable);
        }
        return comments.map(c -> toCommentResponse(c, currentUserId, true));
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentReplies(UUID commentId, UUID currentUserId, Pageable pageable) {
        return commentRepository.findByParentCommentIdAndIsHiddenFalse(commentId, pageable)
                .map(c -> toCommentResponse(c, currentUserId, false));
    }

    @Transactional
    public CommentResponse editComment(UUID userId, UUID commentId, EditCommentRequest request) {
        ForumComment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found or you are not the author"));

        if (comment.isHidden()) {
            throw new ForbiddenException("Cannot edit a hidden comment");
        }

        if (LocalDateTime.now().isAfter(comment.getCreatedAt().plusMinutes(15))) {
            throw new CommentEditWindowExpiredException("Edit window has expired. Comments can only be edited within 15 minutes of posting.");
        }

        comment.setContent(request.content());
        ForumComment saved = commentRepository.save(comment);
        return toCommentResponse(saved, userId, false);
    }

    @Transactional
    public void deleteComment(UUID userId, UUID commentId) {
        ForumComment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found or you are not the author"));

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
    }

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
        return commentRepository.findByAuthorId(userId, pageable)
                .map(c -> {
                    if (c.isHidden()) return null;
                    return toCommentResponse(c, null, false);
                });
    }

    private String resolveAuthorName(UUID authorId) {
        if (authorId == null) {
            return "Unknown User";
        }
        return userRepository.findById(authorId)
                .map(User::getFullName)
                .orElse("Unknown User");
    }

    private CommentResponse toCommentResponse(ForumComment comment, UUID currentUserId, boolean includeRepliesCount) {
        VoteType currentUserVote = null;
        if (currentUserId != null) {
            currentUserVote = voteRepository.findByCommentIdAndUserId(comment.getId(), currentUserId)
                    .map(CommentVote::getVoteType)
                    .orElse(null);
        }

        int replyCount = 0;
        if (includeRepliesCount && comment.getParentCommentId() == null) {
            replyCount = commentRepository.countByParentCommentIdAndIsHiddenFalse(comment.getId());
        }

        return new CommentResponse(
                comment.getId(),
                comment.getJobId(),
                comment.getAuthorId(),
                resolveAuthorName(comment.getAuthorId()),
                comment.getParentCommentId(),
                comment.getContent(),
                comment.getUpvoteCount(),
                comment.isHidden(),
                comment.isFlagged(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replyCount,
                currentUserVote,
                List.of()
        );
    }
}
