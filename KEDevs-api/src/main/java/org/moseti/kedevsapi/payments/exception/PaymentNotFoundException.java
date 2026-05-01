package org.moseti.kedevsapi.payments.exception;

import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;

public class PaymentNotFoundException extends ResourceNotFoundException {
    public PaymentNotFoundException(String message) {
        super(message);
    }
}
