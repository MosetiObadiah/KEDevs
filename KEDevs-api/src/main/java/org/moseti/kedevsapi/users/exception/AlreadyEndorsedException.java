package org.moseti.kedevsapi.users.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class AlreadyEndorsedException extends BadRequestException {

    public AlreadyEndorsedException(String message) {
        super(message);
    }
}
