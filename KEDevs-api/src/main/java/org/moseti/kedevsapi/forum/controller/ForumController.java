package org.moseti.kedevsapi.forum.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.forum.dto.ForumDtos.*;
import org.moseti.kedevsapi.forum.service.ForumService;
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
@Tag(name = "Forum")
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

    @Operation(summary = "Post a top-level comment on a job")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment added successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Job not found")
    })
    @PostMapping("/jobs/{jobId}/comments")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<CommentResponse>> addComment(
            @Parameter(description = "ID of the job") @PathVariable UUID jobId,
            @Valid @RequestBody AddCommentRequest request) {
        CommentResponse response = forumService.addComment(getCurrentUserId(), jobId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment added", response));
    }

    @Operation(summary = "Reply to a comment (1 level deep only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reply added successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot reply to a reply (max 2 levels)"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Job or parent comment not found")
    })
    @PostMapping("/jobs/{jobId}/replies")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<CommentResponse>> addReply(
            @Parameter(description = "ID of the job") @PathVariable UUID jobId,
            @Valid @RequestBody AddReplyRequest request) {
        CommentResponse response = forumService.addReply(getCurrentUserId(), jobId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Reply added", response));
    }

    @Operation(summary = "Get all comments for a job")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comments fetched successfully"),
        @ApiResponse(responseCode = "404", description = "Job not found")
    })
    @GetMapping("/jobs/{jobId}/comments")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<CommentResponse>>> getJobComments(
            @Parameter(description = "ID of the job") @PathVariable UUID jobId,
            @Parameter(description = "Sort by 'new' or 'popular'") @RequestParam(defaultValue = "new") String sortBy,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentResponse> response = forumService.getJobComments(jobId, sortBy, getCurrentUserId(), pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comments fetched", response));
    }

    @Operation(summary = "Get replies for a comment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Replies fetched successfully"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<CommentResponse>>> getCommentReplies(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentResponse> response = forumService.getCommentReplies(commentId, getCurrentUserId(), pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Replies fetched", response));
    }

    @Operation(summary = "Edit own comment (within edit window)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment edited successfully"),
        @ApiResponse(responseCode = "400", description = "Edit window expired"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the author of the comment"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<CommentResponse>> editComment(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId,
            @Valid @RequestBody EditCommentRequest request) {
        CommentResponse response = forumService.editComment(getCurrentUserId(), commentId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment edited", response));
    }

    @Operation(summary = "Delete own comment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Not the author of the comment"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> deleteComment(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId) {
        forumService.deleteComment(getCurrentUserId(), commentId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment deleted"));
    }

    @Operation(summary = "Toggle vote on a comment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Vote recorded successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot vote on own comment"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PostMapping("/comments/{commentId}/vote")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> voteOnComment(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId,
            @Valid @RequestBody VoteCommentRequest request) {
        forumService.voteOnComment(getCurrentUserId(), commentId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Vote recorded"));
    }

    @Operation(summary = "Flag a comment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment flagged successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot flag own comment or already flagged"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PostMapping("/comments/{commentId}/flag")
    @PreAuthorize("hasRole('DEVELOPER') or hasRole('EMPLOYER')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> flagComment(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId,
            @Valid @RequestBody FlagCommentRequest request) {
        forumService.flagComment(getCurrentUserId(), commentId, request);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment flagged"));
    }

    @Operation(summary = "Admin: hide a comment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment hidden successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PatchMapping("/comments/{commentId}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> hideComment(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId) {
        forumService.hideComment(getCurrentUserId(), commentId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment hidden"));
    }

    @Operation(summary = "Admin: unhide a comment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comment unhidden successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PatchMapping("/comments/{commentId}/unhide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Void>> unhideComment(
            @Parameter(description = "ID of the comment") @PathVariable UUID commentId) {
        forumService.unhideComment(getCurrentUserId(), commentId);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("Comment unhidden"));
    }

    @Operation(summary = "Get all comments by a user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User comments fetched successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/users/{userId}/comments")
    public ResponseEntity<org.moseti.kedevsapi.shared.dto.ApiResponse<Page<CommentResponse>>> getUserComments(
            @Parameter(description = "ID of the user") @PathVariable UUID userId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<CommentResponse> response = forumService.getUserComments(userId, pageable);
        return ResponseEntity.ok(org.moseti.kedevsapi.shared.dto.ApiResponse.success("User comments fetched", response));
    }
}
