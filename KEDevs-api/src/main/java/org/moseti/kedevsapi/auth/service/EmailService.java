package org.moseti.kedevsapi.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationCode(String to, String code, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("KEDevs - Email Verification Code");
            message.setText(buildVerificationEmail(fullName, code));
            mailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
        }
    }

    @Async
    public void sendPasswordResetCode(String to, String code, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("KEDevs - Password Reset Code");
            message.setText(buildPasswordResetEmail(fullName, code));
            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Welcome to KEDevs!");
            message.setText(buildWelcomeEmail(fullName));
            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }

    private String buildVerificationEmail(String fullName, String code) {
        return String.format("""
                Hi %s,
                
                Welcome to KEDevs! Please verify your email address using the code below:
                
                %s
                
                This code will expire in 15 minutes.
                
                If you didn't create an account with KEDevs, please ignore this email.
                
                Best regards,
                The KEDevs Team
                """, fullName, code);
    }

    private String buildPasswordResetEmail(String fullName, String code) {
        return String.format("""
                Hi %s,
                
                You requested to reset your password. Use the code below to proceed:
                
                %s
                
                This code will expire in 15 minutes.
                
                If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                
                Best regards,
                The KEDevs Team
                """, fullName, code);
    }

    private String buildWelcomeEmail(String fullName) {
        return String.format("""
                Hi %s,
                
                Your email has been verified successfully! Welcome to KEDevs - Kenya's premier developer community platform.
                
                You now have a 3-day grace period to explore the platform. After that, an annual subscription will be required to continue accessing all features.
                
                Get started:
                - Complete your profile
                - Browse job opportunities
                - Connect with other developers
                - Participate in forums
                
                Best regards,
                The KEDevs Team
                """, fullName);
    }
}

