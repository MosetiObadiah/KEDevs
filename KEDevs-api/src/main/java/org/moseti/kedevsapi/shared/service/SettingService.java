package org.moseti.kedevsapi.shared.service;

import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.payments.repository.PlatformSettingRepository;
import org.moseti.kedevsapi.shared.util.Constants;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SettingService {

    private final PlatformSettingRepository repository;

    public int getInt(String key, int fallback) {
        return repository.findBySettingKey(key)
                .map(s -> Integer.parseInt(s.getSettingValue()))
                .orElse(fallback);
    }

    public BigDecimal getDecimal(String key, BigDecimal fallback) {
        return repository.findBySettingKey(key)
                .map(s -> new BigDecimal(s.getSettingValue()))
                .orElse(fallback);
    }

    public int getContactLimit() {
        return getInt("CONTACT_REQUEST_DAILY_LIMIT", Constants.MAX_CONTACT_REQUESTS_PER_DAY);
    }

    public int getCommentEditWindow() {
        return getInt("COMMENT_EDIT_WINDOW", Constants.EDIT_WINDOW_MINUTES);
    }

    public int getCommentDeleteWindow() {
        return getInt("COMMENT_DELETE_WINDOW", Constants.DELETE_WINDOW_MINUTES);
    }
}
