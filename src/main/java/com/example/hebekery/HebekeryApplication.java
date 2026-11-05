package com.example.hebekery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HebekeryApplication {
    public static void main(String[] args) {
        SpringApplication.run(HebekeryApplication.class, args);
    }
}
