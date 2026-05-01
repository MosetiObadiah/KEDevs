package org.moseti.kedevsapi.forum.exception;

import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;

public class CommentNotFoundException extends ResourceNotFoundException {
    public CommentNotFoundException(String message) {
        super(message);
    }
}
