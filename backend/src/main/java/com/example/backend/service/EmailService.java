package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Async;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async("otpExecutor")
    public CompletableFuture<Boolean> sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your OTP for Login");
        message.setText("Your OTP is: " + otp + ". This OTP will expire in 5 minutes.");
        try {
            mailSender.send(message);
            return CompletableFuture.completedFuture(true);
        } catch (MailException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }
}
