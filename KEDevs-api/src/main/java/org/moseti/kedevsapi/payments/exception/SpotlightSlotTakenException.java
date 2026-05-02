package org.moseti.kedevsapi.payments.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class SpotlightSlotTakenException extends BadRequestException {
    public SpotlightSlotTakenException(String message) {
        super(message);
    }
}
