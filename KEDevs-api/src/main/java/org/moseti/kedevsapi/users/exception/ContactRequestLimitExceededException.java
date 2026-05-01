package org.moseti.kedevsapi.users.exception;

public class ContactRequestLimitExceededException extends RuntimeException {
    public ContactRequestLimitExceededException(String message) {
        super(message);
    }
}
