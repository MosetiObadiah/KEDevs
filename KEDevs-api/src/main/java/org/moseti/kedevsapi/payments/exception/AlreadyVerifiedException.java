package org.moseti.kedevsapi.payments.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class AlreadyVerifiedException extends BadRequestException {
    public AlreadyVerifiedException(String message) {
        super(message);
    }
}
