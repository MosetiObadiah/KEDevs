package org.moseti.kedevsapi.jobs.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class CannotApplyToOwnJobException extends BadRequestException {
    public CannotApplyToOwnJobException(String message) {
        super(message);
    }
}
