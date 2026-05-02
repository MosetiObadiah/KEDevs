package org.moseti.kedevsapi.admin.exception;

import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;

public class SettingNotFoundException extends ResourceNotFoundException {
    public SettingNotFoundException(String message) {
        super(message);
    }
}
