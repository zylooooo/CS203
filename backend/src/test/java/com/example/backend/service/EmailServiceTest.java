package com.example.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.InternetAddress;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    private static final String SUBJECT = "Email Verification";
    private static final String TEXT = "Please verify your email address.";

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender);
    }

    @Test
    void sendVerificationEmail_Success() throws MessagingException {
        // Arrange
        String to = "test@example.com";
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // Act
        emailService.sendVerificationEmail(to, SUBJECT, TEXT);

        // Assert
        ArgumentCaptor<MimeMessage> mimeMessageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(mimeMessageCaptor.capture());
        MimeMessage sentMessage = mimeMessageCaptor.getValue();

        verify(sentMessage).setRecipient(eq(jakarta.mail.Message.RecipientType.TO), eq(new InternetAddress(to)));
        verify(sentMessage).setSubject(SUBJECT);
        verify(sentMessage).setContent(any(jakarta.mail.Multipart.class));
        
        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendVerificationEmail_InvalidEmail_ThrowsException() {
        // Arrange
        String invalidEmail = "invalid.email";

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            emailService.sendVerificationEmail(invalidEmail, SUBJECT, TEXT));
        assertEquals("Invalid email address", exception.getMessage());

        // Verify that no email was sent
        verify(mailSender, never()).createMimeMessage();
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
