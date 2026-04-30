package org.moseti.kedevsapi.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyCodeRequest {

    @NotBlank(message = "Code is required")
    private String code;
}

