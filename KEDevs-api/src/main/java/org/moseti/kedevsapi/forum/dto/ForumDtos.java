package org.moseti.kedevsapi.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.moseti.kedevsapi.shared.enums.CommentFlagStatus;
import org.moseti.kedevsapi.shared.enums.VoteType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ForumDtos {

    public record AddCommentRequest(
            @NotBlank(message = "Content cannot be blank")
            @Size(min = 1, max = 2000, message = "Content must be between 1 and 2000 characters")
            @Schema(description = "Content of the comment", example = "This is a great job opportunity!")
            String content
    ) {}

    public record AddReplyRequest(
            @NotBlank(message = "Content cannot be blank")
            @Size(min = 1, max = 2000, message = "Content must be between 1 and 2000 characters")
            @Schema(description = "Content of the reply", example = "I agree with you.")
            String content,

            @NotNull(message = "Parent comment ID cannot be null")
            @Schema(description = "ID of the comment being replied to")
            UUID parentCommentId
    ) {}

    public record EditCommentRequest(
            @NotBlank(message = "Content cannot be blank")
            @Size(min = 1, max = 2000, message = "Content must be between 1 and 2000 characters")
            @Schema(description = "New content of the comment", example = "Updated comment content.")
            String content
    ) {}

    public record VoteCommentRequest(
            @NotNull(message = "Vote type cannot be null")
            @Schema(description = "Type of vote", example = "UPVOTE")
            VoteType voteType
    ) {}

    public record FlagCommentRequest(
            @NotBlank(message = "Reason cannot be blank")
            @Size(max = 500, message = "Reason cannot exceed 500 characters")
            @Schema(description = "Reason for flagging the comment", example = "This comment is offensive.")
            String reason
    ) {}

    public record CommentResponse(
            UUID id,
            UUID jobId,
            UUID authorId,
            String authorName,
            String authorRole,
            UUID parentCommentId,
            String content,
            int upvoteCount,
            boolean isHidden,
            boolean isFlagged,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            int replyCount,
            VoteType currentUserVote,
            List<CommentResponse> replies
    ) {}

    public record CommentFlagResponse(
            UUID id,
            UUID commentId,
            UUID flaggedById,
            String reason,
            CommentFlagStatus status,
            LocalDateTime createdAt
    ) {}
}
