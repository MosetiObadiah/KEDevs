package org.moseti.kedevsapi.auth.exception;

import lombok.Getter;
import java.util.UUID;

@Getter
public class EmailNotVerifiedException extends RuntimeException {
    private final UUID userId;

    public EmailNotVerifiedException(String message, UUID userId) {
        super(message);
        this.userId = userId;
    }
}
