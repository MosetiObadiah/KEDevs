package org.moseti.kedevsapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@org.springframework.data.jpa.repository.config.EnableJpaAuditing
public class KeDevsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(KeDevsApiApplication.class, args);
    }

}
