package org.moseti.kedevsapi.spotlight.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class SpotlightAlreadyActiveException extends BadRequestException {
    public SpotlightAlreadyActiveException(String message) {
        super(message);
    }
}
