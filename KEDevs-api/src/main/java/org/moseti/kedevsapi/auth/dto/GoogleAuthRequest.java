package org.moseti.kedevsapi.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.moseti.kedevsapi.shared.enums.Role;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "ID token is required")
    @Schema(description = "Google ID token from client SDK", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFh...")
    private String idToken;

    // Required only for new users. Existing users will use their existing role
    @Schema(description = "Account role (required for new users only)", allowableValues = {"DEVELOPER", "EMPLOYER"}, example = "DEVELOPER")
    private Role role;
}

