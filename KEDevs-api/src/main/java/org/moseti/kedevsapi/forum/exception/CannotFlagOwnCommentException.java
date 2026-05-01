package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CannotFlagOwnCommentException extends BadRequestException {
    public CannotFlagOwnCommentException(String message) {
        super(message);
    }
}
