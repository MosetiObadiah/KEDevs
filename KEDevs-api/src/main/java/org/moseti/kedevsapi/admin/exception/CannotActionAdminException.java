package org.moseti.kedevsapi.admin.exception;

import org.moseti.kedevsapi.shared.exception.ForbiddenException;

public class CannotActionAdminException extends ForbiddenException {
    public CannotActionAdminException(String message) {
        super(message);
    }
}
