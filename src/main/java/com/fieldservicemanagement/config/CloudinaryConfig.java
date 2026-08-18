package com.fieldservicemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {

        String cloudinaryUrl =
                System.getenv("CLOUDINARY_URL");

        if (cloudinaryUrl == null
                || cloudinaryUrl.isBlank()) {

            throw new IllegalStateException(
                    "CLOUDINARY_URL environment variable is not configured"
            );
        }

        return new Cloudinary(cloudinaryUrl);
    }
}