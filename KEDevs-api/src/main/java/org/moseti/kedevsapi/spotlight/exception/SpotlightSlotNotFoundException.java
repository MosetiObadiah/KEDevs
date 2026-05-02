package org.moseti.kedevsapi.spotlight.exception;

import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;

public class SpotlightSlotNotFoundException extends ResourceNotFoundException {
    public SpotlightSlotNotFoundException(String message) {
        super(message);
    }
}
