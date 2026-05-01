package org.moseti.kedevsapi.payments.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class AlreadySubscribedException extends BadRequestException {
    public AlreadySubscribedException(String message) {
        super(message);
    }
}
