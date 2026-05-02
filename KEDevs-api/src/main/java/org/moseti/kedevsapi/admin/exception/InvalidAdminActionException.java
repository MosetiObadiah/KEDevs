package org.moseti.kedevsapi.admin.exception;

import org.moseti.kedevsapi.shared.exception.BadRequestException;

public class InvalidAdminActionException extends BadRequestException {
    public InvalidAdminActionException(String message) {
        super(message);
    }
}
