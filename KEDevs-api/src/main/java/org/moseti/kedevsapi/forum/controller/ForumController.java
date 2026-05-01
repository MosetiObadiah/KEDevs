package org.moseti.kedevsapi.forum.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.forum.dto.ForumDtos.*;
import org.moseti.kedevsapi.forum.service.ForumService;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    private UUID getCurrentUserId() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        return null;
    }

    @PostMapping("/jobs/{jobId}/comments")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID jobId,
            @Valid @RequestBody AddCommentRequest request) {
        CommentResponse response = forumService.addComment(getCurrentUserId(), jobId, request);
        return ResponseEntity.ok(ApiResponse.success("Comment added", response));
    }

    @PostMapping("/jobs/{jobId}/replies")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<CommentResponse>> addReply(
            @PathVariable UUID jobId,
            @Valid @RequestBody AddReplyRequest request) {
        CommentResponse response = forumService.addReply(getCurrentUserId(), jobId, request);
        return ResponseEntity.ok(ApiResponse.success("Reply added", response));
    }

    @GetMapping("/jobs/{jobId}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getJobComments(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "new") String sortBy,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentResponse> response = forumService.getJobComments(jobId, sortBy, getCurrentUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Comments fetched", response));
    }

    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getCommentReplies(
            @PathVariable UUID commentId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentResponse> response = forumService.getCommentReplies(commentId, getCurrentUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Replies fetched", response));
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<CommentResponse>> editComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody EditCommentRequest request) {
        CommentResponse response = forumService.editComment(getCurrentUserId(), commentId, request);
        return ResponseEntity.ok(ApiResponse.success("Comment edited", response));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID commentId) {
        forumService.deleteComment(getCurrentUserId(), commentId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted"));
    }

    @PostMapping("/comments/{commentId}/vote")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Void>> voteOnComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody VoteCommentRequest request) {
        forumService.voteOnComment(getCurrentUserId(), commentId, request);
        return ResponseEntity.ok(ApiResponse.success("Vote recorded"));
    }

    @PostMapping("/comments/{commentId}/flag")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Void>> flagComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody FlagCommentRequest request) {
        forumService.flagComment(getCurrentUserId(), commentId, request);
        return ResponseEntity.ok(ApiResponse.success("Comment flagged"));
    }

    @PatchMapping("/comments/{commentId}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hideComment(
            @PathVariable UUID commentId) {
        forumService.hideComment(getCurrentUserId(), commentId);
        return ResponseEntity.ok(ApiResponse.success("Comment hidden"));
    }

    @PatchMapping("/comments/{commentId}/unhide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unhideComment(
            @PathVariable UUID commentId) {
        forumService.unhideComment(getCurrentUserId(), commentId);
        return ResponseEntity.ok(ApiResponse.success("Comment unhidden"));
    }

    @GetMapping("/users/{userId}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getUserComments(
            @PathVariable UUID userId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentResponse> response = forumService.getUserComments(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("User comments fetched", response));
    }
}
