package org.moseti.kedevsapi.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Response from Google's tokeninfo endpoint
 */
@Data
public class GoogleTokenInfo {

    @JsonProperty("sub")
    private String sub; // Google user ID

    @JsonProperty("email")
    private String email;

    @JsonProperty("name")
    private String name;

    @JsonProperty("email_verified")
    private String emailVerified; // String "true" or "false"

    @JsonProperty("picture")
    private String picture;

    @JsonProperty("iss")
    private String issuer; // Should be accounts.google.com or https://accounts.google.com

    @JsonProperty("aud")
    private String audience; // Should match your Google Client ID

    @JsonProperty("exp")
    private String expiration;
}

