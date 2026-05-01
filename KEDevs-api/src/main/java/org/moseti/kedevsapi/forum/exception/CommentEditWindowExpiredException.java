package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CommentEditWindowExpiredException extends BadRequestException {
    public CommentEditWindowExpiredException(String message) {
        super(message);
    }
}
