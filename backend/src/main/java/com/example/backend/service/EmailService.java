package com.example.backend.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    /**
     * Constructs an EmailService with the specified JavaMailSender.
     *
     * @param mailSender the JavaMailSender used to send emails.
     */
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a verification email to the specified recipient.
     *
     * @param to      the recipient's email address.
     * @param subject the subject of the email.
     * @param text    the body of the email, which can be HTML formatted.
     * @throws MessagingException if there is an error while sending the email.
     * @throws IllegalArgumentException if the provided email address is invalid.
     */
    public void sendVerificationEmail(String to, String subject, String text) throws MessagingException {
        if (!isValidEmail(to)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        mailSender.send(message);
    }

    /**
     * Validates the provided email address.
     *
     * @param email the email address to validate.
     * @return true if the email address is valid, false otherwise.
     */
    private boolean isValidEmail(String email) {
        try {
            InternetAddress emailAddr = new InternetAddress(email);
            emailAddr.validate();
            return true;
        } catch (AddressException ex) {
            return false;
        }
    }
}
