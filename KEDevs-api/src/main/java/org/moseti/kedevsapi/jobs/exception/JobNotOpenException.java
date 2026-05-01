package org.moseti.kedevsapi.jobs.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class JobNotOpenException extends BadRequestException {
    public JobNotOpenException(String message) {
        super(message);
    }
}
