package org.moseti.kedevsapi.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void sendVerificationCode(String to, String code, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
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
            message.setFrom(fromEmail);
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
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to KEDevs!");
            message.setText(buildWelcomeEmail(fullName));
            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }

    @Async
    public void sendPaymentConfirmationEmail(String to, String fullName, String paymentType, java.math.BigDecimal amount, String receiptNo) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Payment Confirmed - KEDevs");
            message.setText(String.format("""
                    Hi %s,
                    
                    Your payment of KES %s for %s has been confirmed.
                    M-Pesa Receipt: %s.
                    
                    Thank you!
                    
                    Best regards,
                    The KEDevs Team
                    """, fullName, amount, paymentType, receiptNo));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email to: {}", to, e);
        }
    }

    @Async
    public void sendSubscriptionExpiryWarningEmail(String to, String fullName, java.time.LocalDateTime expiryDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your KEDevs Subscription Expires Soon");
            message.setText(String.format("""
                    Hi %s,
                    
                    Your subscription expires on %s.
                    Renew now to maintain access.
                    
                    Best regards,
                    The KEDevs Team
                    """, fullName, expiryDate));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send subscription expiry warning email to: {}", to, e);
        }
    }

    @Async
    public void sendJobApplicationEmail(String to, String posterName, String jobTitle, String applicantName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("New Application - " + jobTitle);
            message.setText(String.format("""
                    Hi %s,
                    
                    %s has applied to your job post: %s.
                    
                    Best regards,
                    The KEDevs Team
                    """, posterName, applicantName, jobTitle));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send job application email to: {}", to, e);
        }
    }

    @Async
    public void sendJobFlaggedEmail(String to, String jobTitle, String reporterName, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Job Flagged for Review - KEDevs Admin");
            message.setText(String.format("""
                    A job post '%s' has been flagged by %s.
                    Reason: %s.
                    
                    Please review.
                    
                    Best regards,
                    The KEDevs Team
                    """, jobTitle, reporterName, reason));
            try {
                mailSender.send(message);
            } catch (MailAuthenticationException e) {
                log.warn("Could not send admin email (dev email service limit reached): {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to send job flagged email to: {}", to, e);
        }
    }

    @Async
    public void sendSpotlightExpiredEmail(String to, String fullName, String spotlightType) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your Spotlight Has Ended - KEDevs");
            message.setText(String.format("""
                    Hi %s,
                    
                    Your Dev of the %s spotlight has ended.
                    Thank you for being featured!
                    
                    Best regards,
                    The KEDevs Team
                    """, fullName, spotlightType));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send spotlight expired email to: {}", to, e);
        }
    }

    @Async
    public void sendSpotlightOverriddenEmail(String to, String fullName, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your Spotlight Has Been Removed - KEDevs");
            message.setText(String.format("""
                    Hi %s,
                    
                    Your spotlight has been removed by an admin.
                    Reason: %s.
                    
                    Best regards,
                    The KEDevs Team
                    """, fullName, reason));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send spotlight overridden email to: {}", to, e);
        }
    }

    @Async
    public void sendJobAdvertisementExpiredEmail(String to, String fullName, String jobTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your Job Advertisement Has Ended - KEDevs");
            message.setText(String.format("""
                    Hi %s,
                    
                    Your job advertisement for '%s' has ended.
                    Thank you for promoting your job!
                    
                    Best regards,
                    The KEDevs Team
                    """, fullName, jobTitle));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send job advertisement expired email to: {}", to, e);
        }
    }

    @Async
    public void sendJobAdvertisementOverriddenEmail(String to, String fullName, String jobTitle, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your Job Advertisement Has Been Removed - KEDevs");
            message.setText(String.format("""
                    Hi %s,
                    
                    Your job advertisement for '%s' has been removed by an admin.
                    Reason: %s.
                    
                    Best regards,
                    The KEDevs Team
                    """, fullName, jobTitle, reason));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send job advertisement overridden email to: {}", to, e);
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
                
                Get started:
                - Complete your profile
                - Browse job opportunities
                - Connect with other developers
                - Participate in forums
                
                Boost your presence:
                Stand out by verifying your profile and buying Spotlight slots! 
                Spotlight features your profile or job postings at the top of the feed, giving you maximum visibility to the community.
                
                Best regards,
                The KEDevs Team
                """, fullName);
    }
}

