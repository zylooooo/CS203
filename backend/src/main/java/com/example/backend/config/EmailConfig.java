package com.example.backend.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.context.annotation.Bean;

/**
 * Configuration class for email service settings.
 * Configures the JavaMailSender with Gmail SMTP settings for sending emails.
 */
@Configuration
public class EmailConfig {

    /**
     * Gmail username injected from environment variables.
     */
    @Value("${SPRING_MAIL_USERNAME}")
    private String emailUsername;

    /**
     * Gmail password or app-specific password injected from environment variables.
     */
    @Value("${SPRING_MAIL_PASSWORD}")
    private String emailPassword;

    /**
     * Creates and configures a JavaMailSender bean for sending emails.
     * Sets up SMTP configuration for Gmail with authentication and TLS.
     *
     * @return configured JavaMailSender instance
     */
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(emailUsername);
        mailSender.setPassword(emailPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");

        return mailSender;
    }
}
