package org.moseti.kedevsapi;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DarajaConfigCheck {

    @Value("${daraja.callback.url}")
    private String callbackUrl;

    @PostConstruct
    public void init() {
        // This will print to your console immediately after the bean is initialized
        System.out.println("DEBUG: The callback URL is: " + callbackUrl);
    }
}