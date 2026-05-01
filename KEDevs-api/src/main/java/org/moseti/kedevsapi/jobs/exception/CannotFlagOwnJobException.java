package org.moseti.kedevsapi.jobs.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CannotFlagOwnJobException extends BadRequestException {
    public CannotFlagOwnJobException(String message) {
        super(message);
    }
}
