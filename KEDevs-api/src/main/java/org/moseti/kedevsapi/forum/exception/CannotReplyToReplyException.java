package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CannotReplyToReplyException extends BadRequestException {
    public CannotReplyToReplyException(String message) {
        super(message);
    }
}
