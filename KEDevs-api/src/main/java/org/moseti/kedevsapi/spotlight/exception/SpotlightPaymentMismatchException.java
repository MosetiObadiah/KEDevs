package org.moseti.kedevsapi.spotlight.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class SpotlightPaymentMismatchException extends BadRequestException {
    public SpotlightPaymentMismatchException(String message) {
        super(message);
    }
}
