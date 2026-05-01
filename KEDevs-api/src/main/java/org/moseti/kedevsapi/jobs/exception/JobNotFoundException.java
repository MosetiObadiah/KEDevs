package org.moseti.kedevsapi.jobs.exception;

import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;

public class JobNotFoundException extends ResourceNotFoundException {
    public JobNotFoundException(String message) {
        super(message);
    }
}
