package org.moseti.kedevsapi.shared.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum JobVisibility {
    PUBLIC,
    PRIVATE;

    @JsonCreator
    public static JobVisibility fromValue(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        switch (normalized) {
            case "PUBLIC", "EXTERNAL":
                return PUBLIC;
            case "PRIVATE", "INTERNAL":
                return PRIVATE;
            default:
                throw new IllegalArgumentException("Unknown JobVisibility: " + value);
        }
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}