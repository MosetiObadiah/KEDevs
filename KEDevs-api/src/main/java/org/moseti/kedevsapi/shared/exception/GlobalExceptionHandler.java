package org.moseti.kedevsapi.shared.exception;

import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.auth.exception.AccountNotApprovedException;
import org.moseti.kedevsapi.auth.exception.EmailAlreadyExistsException;
import org.moseti.kedevsapi.auth.exception.EmailNotVerifiedException;
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
import org.moseti.kedevsapi.payments.exception.AlreadySubscribedException;
import org.moseti.kedevsapi.payments.exception.AlreadyVerifiedException;
import org.moseti.kedevsapi.payments.exception.DarajaApiException;
import org.moseti.kedevsapi.payments.exception.InsufficientSearchTokensException;
import org.moseti.kedevsapi.payments.exception.PaymentAlreadyProcessedException;
import org.moseti.kedevsapi.payments.exception.PaymentNotFoundException;
import org.moseti.kedevsapi.payments.exception.PaywallException;
import org.moseti.kedevsapi.payments.exception.SpotlightSlotTakenException;
import org.moseti.kedevsapi.spotlight.exception.SpotlightAlreadyActiveException;
import org.moseti.kedevsapi.spotlight.exception.SpotlightPaymentMismatchException;
import org.moseti.kedevsapi.spotlight.exception.SpotlightSlotNotFoundException;
import org.moseti.kedevsapi.notifications.exception.NotificationNotFoundException;
import org.moseti.kedevsapi.admin.exception.CannotActionAdminException;
import org.moseti.kedevsapi.admin.exception.InvalidAdminActionException;
import org.moseti.kedevsapi.admin.exception.SettingNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
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
        log.error("Unexpected error occurred", ex);
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

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleEmailNotVerified(EmailNotVerifiedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage(), Map.of("userId", ex.getUserId())));
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

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handlePaymentNotFound(PaymentNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(PaymentAlreadyProcessedException.class)
    public ResponseEntity<ApiResponse<Void>> handlePaymentAlreadyProcessed(PaymentAlreadyProcessedException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AlreadySubscribedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAlreadySubscribed(AlreadySubscribedException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AlreadyVerifiedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAlreadyVerified(AlreadyVerifiedException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(PaywallException.class)
    public ResponseEntity<ApiResponse<Void>> handlePaywall(PaywallException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYMENT_REQUIRED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(InsufficientSearchTokensException.class)
    public ResponseEntity<ApiResponse<Void>> handleInsufficientSearchTokens(InsufficientSearchTokensException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYMENT_REQUIRED)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DarajaApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleDarajaApi(DarajaApiException ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Payment service unavailable. Please try again."));
    }

    @ExceptionHandler(SpotlightSlotTakenException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpotlightSlotTaken(SpotlightSlotTakenException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(SpotlightAlreadyActiveException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpotlightAlreadyActive(SpotlightAlreadyActiveException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(SpotlightPaymentMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpotlightPaymentMismatch(SpotlightPaymentMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(SpotlightSlotNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpotlightSlotNotFound(SpotlightSlotNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotificationNotFound(NotificationNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CannotActionAdminException.class)
    public ResponseEntity<ApiResponse<Void>> handleCannotActionAdmin(CannotActionAdminException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(InvalidAdminActionException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidAdminAction(InvalidAdminActionException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(SettingNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleSettingNotFound(SettingNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
}