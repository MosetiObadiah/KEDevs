package org.moseti.kedevsapi.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.moseti.kedevsapi.shared.enums.Role;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    // Required only for new users. Existing users will use their existing role
    private Role role;
}

