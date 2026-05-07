package org.moseti.kedevsapi.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.moseti.kedevsapi.shared.enums.Role;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private UUID userId;
    private String email;
    private String fullName;
    private Role role;
    private boolean emailVerified;
    private boolean requiresApproval;
    private boolean onboarded;
    private boolean inGracePeriod;
}


