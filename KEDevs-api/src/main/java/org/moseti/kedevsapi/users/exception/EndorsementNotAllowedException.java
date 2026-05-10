package org.moseti.kedevsapi.users.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class EndorsementNotAllowedException extends BadRequestException {
    public EndorsementNotAllowedException(String message) {
        super(message);
    }
}
