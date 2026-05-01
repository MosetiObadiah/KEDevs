package org.moseti.kedevsapi.jobs.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class AlreadyAppliedException extends BadRequestException {
    public AlreadyAppliedException(String message) {
        super(message);
    }
}
