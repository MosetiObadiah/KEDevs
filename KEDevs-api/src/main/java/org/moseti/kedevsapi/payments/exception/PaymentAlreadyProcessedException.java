package org.moseti.kedevsapi.payments.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class PaymentAlreadyProcessedException extends BadRequestException {
    public PaymentAlreadyProcessedException(String message) {
        super(message);
    }
}
