package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CommentDeleteWindowExpiredException extends BadRequestException {

    public CommentDeleteWindowExpiredException(String message) {
        super(message);
    }
}
