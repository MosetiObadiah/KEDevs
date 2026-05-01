package org.moseti.kedevsapi.shared.exception;

import org.apache.coyote.BadRequestException;
import org.moseti.kedevsapi.auth.exception.AccountNotApprovedException;
import org.moseti.kedevsapi.auth.exception.EmailAlreadyExistsException;
import org.moseti.kedevsapi.auth.exception.InvalidCredentialsException;
import org.moseti.kedevsapi.auth.exception.InvalidTokenException;
import org.moseti.kedevsapi.auth.exception.InvalidVerificationCodeException;
import org.moseti.kedevsapi.shared.dto.ApiResponse;
import org.moseti.kedevsapi.users.exception.ContactRequestLimitExceededException;
import org.moseti.kedevsapi.users.exception.EndorsementNotAllowedException;
import org.moseti.kedevsapi.users.exception.NotProAccountException;
import org.moseti.kedevsapi.users.exception.ProfileAlreadyExistsException;
import org.moseti.kedevsapi.users.exception.ProfileNotFoundException;
import org.moseti.kedevsapi.forum.exception.CommentNotFoundException;
import org.moseti.kedevsapi.forum.exception.CommentEditWindowExpiredException;
import org.moseti.kedevsapi.forum.exception.CannotReplyToReplyException;
import org.moseti.kedevsapi.forum.exception.CannotVoteOnOwnCommentException;
import org.moseti.kedevsapi.forum.exception.CannotFlagOwnCommentException;
import org.moseti.kedevsapi.forum.exception.AlreadyFlaggedCommentException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmailExists(EmailAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(InvalidVerificationCodeException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCode(InvalidVerificationCodeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidToken(InvalidTokenException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AccountNotApprovedException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotApproved(AccountNotApprovedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ProfileAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleProfileAlreadyExists(ProfileAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ProfileNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleProfileNotFound(ProfileNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(EndorsementNotAllowedException.class)
    public ResponseEntity<ApiResponse<Void>> handleEndorsementNotAllowed(EndorsementNotAllowedException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ContactRequestLimitExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleContactRequestLimit(ContactRequestLimitExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(NotProAccountException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotProAccount(NotProAccountException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CommentNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleCommentNotFound(CommentNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CommentEditWindowExpiredException.class)
    public ResponseEntity<ApiResponse<Void>> handleCommentEditWindowExpired(CommentEditWindowExpiredException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CannotReplyToReplyException.class)
    public ResponseEntity<ApiResponse<Void>> handleCannotReplyToReply(CannotReplyToReplyException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CannotVoteOnOwnCommentException.class)
    public ResponseEntity<ApiResponse<Void>> handleCannotVoteOnOwnComment(CannotVoteOnOwnCommentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CannotFlagOwnCommentException.class)
    public ResponseEntity<ApiResponse<Void>> handleCannotFlagOwnComment(CannotFlagOwnCommentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AlreadyFlaggedCommentException.class)
    public ResponseEntity<ApiResponse<Void>> handleAlreadyFlaggedComment(AlreadyFlaggedCommentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }
}