package org.moseti.kedevsapi.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketEvent<T> {
    private String type; // e.g., "NEW_COMMENT", "VOTE_UPDATE", "NEW_NOTIFICATION"
    private T data;
}
