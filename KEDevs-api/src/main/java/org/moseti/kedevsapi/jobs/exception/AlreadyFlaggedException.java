package org.moseti.kedevsapi.jobs.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class AlreadyFlaggedException extends BadRequestException {
    public AlreadyFlaggedException(String message) {
        super(message);
    }
}
