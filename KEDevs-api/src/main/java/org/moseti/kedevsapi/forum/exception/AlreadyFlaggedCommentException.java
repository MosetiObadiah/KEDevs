package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class AlreadyFlaggedCommentException extends BadRequestException {
    public AlreadyFlaggedCommentException(String message) {
        super(message);
    }
}
