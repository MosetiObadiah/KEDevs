package org.moseti.kedevsapi.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.moseti.kedevsapi.shared.enums.Role;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "User's password (min 8 chars)", example = "SecurePass123!")
    private String password;

    @NotBlank(message = "Full name is required")
    @Schema(description = "User's full name", example = "John Doe")
    private String fullName;

    @NotNull(message = "Role is required")
    @Schema(description = "Account role", allowableValues = {"DEVELOPER", "EMPLOYER"}, example = "DEVELOPER")
    private Role role;
}

