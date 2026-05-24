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
    private boolean isVerified;
    private String accountStatus;
    private String rejectionReason;

    /** Returns a copy of this response with tokens stripped — used when tokens are set as httpOnly cookies instead. */
    public AuthResponse withoutTokens() {
        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .tokenType(null)
                .userId(this.userId)
                .email(this.email)
                .fullName(this.fullName)
                .role(this.role)
                .emailVerified(this.emailVerified)
                .requiresApproval(this.requiresApproval)
                .onboarded(this.onboarded)
                .isVerified(this.isVerified)
                .accountStatus(this.accountStatus)
                .rejectionReason(this.rejectionReason)
                .build();
    }
}


