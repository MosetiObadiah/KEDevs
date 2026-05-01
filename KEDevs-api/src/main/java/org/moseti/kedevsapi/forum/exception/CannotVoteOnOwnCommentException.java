package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CannotVoteOnOwnCommentException extends BadRequestException {
    public CannotVoteOnOwnCommentException(String message) {
        super(message);
    }
}
