// package com.example.backend.service;

// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.mail.javamail.MimeMessageHelper;
// import org.springframework.stereotype.Service;

// import jakarta.mail.MessagingException;
// import jakarta.mail.internet.MimeMessage;

// @Service
// public class EmailService {
//     private final JavaMailSender mailSender;

//     public EmailService(JavaMailSender mailSender) {
//         this.mailSender = mailSender;
//     }

//     public void sendVerificationEmail(String to, String subject, String text) throws MessagingException {
//         MimeMessage message = mailSender.createMimeMessage(); // used to create a new email message
//         MimeMessageHelper helper = new MimeMessageHelper(message, true); // true allows for attachments and html

//         helper.setTo(to);
//         helper.setSubject(subject);
//         helper.setText(text, true);

//         mailSender.send(message);
    
//     }
// }

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

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

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
