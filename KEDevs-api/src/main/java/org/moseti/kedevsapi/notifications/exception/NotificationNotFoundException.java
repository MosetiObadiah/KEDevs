package org.moseti.kedevsapi.notifications.exception;

import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;

public class NotificationNotFoundException extends ResourceNotFoundException {
    public NotificationNotFoundException(String message) {
        super(message);
    }
}
