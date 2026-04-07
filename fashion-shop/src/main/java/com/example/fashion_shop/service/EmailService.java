package com.example.fashion_shop.service;

import com.example.fashion_shop.config.EmailConfig;
import com.example.fashion_shop.entity.Order;
import com.example.fashion_shop.entity.Review;
import com.example.fashion_shop.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailConfig emailConfig;

    /**
     * Send order confirmation email
     */
    public void sendOrderConfirmationEmail(Order order) {
        try {
            String subject = "Order Confirmation - Order #" + order.getOrderCode();
            String htmlContent = buildOrderConfirmationHtml(order);

            sendHtmlEmail(order.getUser().getEmail(), subject, htmlContent);
            log.info("Order confirmation email sent to {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
        }
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            String subject = "Password Reset Request - Fashionable Shop";
            String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetHtml(user.getFullName(), resetUrl);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Password reset email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }
    }

    /**
     * Send review notification email to seller (for each review)
     */
    public void sendReviewNotificationEmail(Review review) {
        try {
            String subject = "New Review on your product - " + review.getProduct().getName();
            String htmlContent = buildReviewNotificationHtml(review);

            sendHtmlEmail("admin@fashionable-shop.com", subject, htmlContent);
            log.info("Review notification email sent");
        } catch (Exception e) {
            log.error("Failed to send review notification email", e);
        }
    }

    /**
     * Send welcome email to new user
     */
    public void sendWelcomeEmail(User user) {
        try {
            String subject = "Welcome to Fashionable Shop!";
            String htmlContent = buildWelcomeHtml(user.getFullName());

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Welcome email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
        }
    }

    /**
     * Send order cancellation email
     */
    public void sendOrderCancellationEmail(Order order) {
        try {
            String subject = "Order Cancelled - Order #" + order.getOrderCode();
            String htmlContent = buildOrderCancellationHtml(order);

            sendHtmlEmail(order.getUser().getEmail(), subject, htmlContent);
            log.info("Order cancellation email sent to {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send order cancellation email", e);
        }
    }

    /**
     * Send HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(emailConfig.getMailFrom());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    /**
     * Build order confirmation HTML
     */
    private String buildOrderConfirmationHtml(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        StringBuilder html = new StringBuilder();
        html.append("<html><body style=\"font-family: Arial, sans-serif;\">");
        html.append("<div style=\"max-width: 600px; margin: 0 auto;\">");
        html.append("<h2>Order Confirmation</h2>");
        html.append("<p>Dear ").append(order.getUser().getFullName()).append(",</p>");
        html.append("<p>Thank you for your order! Here are your order details:</p>");
        html.append("<table style=\"width: 100%; border-collapse: collapse;\">");
        html.append("<tr style=\"background-color: #f2f2f2;\">");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px;\">Order Code</th>");
        html.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(order.getOrderCode()).append("</td>");
        html.append("</tr>");
        html.append("<tr>");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Date</th>");
        html.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(order.getCreatedAt().format(formatter)).append("</td>");
        html.append("</tr>");
        html.append("<tr style=\"background-color: #f2f2f2;\">");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Status</th>");
        html.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(order.getStatus().name()).append("</td>");
        html.append("</tr>");
        html.append("<tr>");
        html.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Total Amount</th>");
        html.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(order.getTotalAmount()).append(" VND</td>");
        html.append("</tr>");
        html.append("</table>");
        html.append("<p><br/>Items ordered:</p>");
        html.append("<ul>");
        order.getItems().forEach(item ->
            html.append("<li>").append(item.getProduct().getName()).append(" x").append(item.getQuantity())
                .append(" = ").append(item.getPriceAtPurchase().multiply(new BigDecimal(item.getQuantity()))).append(" VND</li>")
        );
        html.append("</ul>");
        html.append("<p>We will notify you when your order is shipped.</p>");
        html.append("<p>Best regards,<br/>Fashionable Shop Team</p>");
        html.append("</div></body></html>");

        return html.toString();
    }

    /**
     * Build password reset HTML
     */
    private String buildPasswordResetHtml(String fullName, String resetUrl) {
        return "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<div style=\"max-width: 600px; margin: 0 auto;\">" +
                "<h2>Password Reset Request</h2>" +
                "<p>Dear " + fullName + ",</p>" +
                "<p>We received a request to reset your password. Click the link below to reset it:</p>" +
                "<p><a href=\"" + resetUrl + "\" style=\"background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Reset Password</a></p>" +
                "<p>This link expires in 1 hour.</p>" +
                "<p>If you didn't request this, ignore this email.</p>" +
                "<p>Best regards,<br/>Fashionable Shop Team</p>" +
                "</div></body></html>";
    }

    /**
     * Build review notification HTML
     */
    private String buildReviewNotificationHtml(Review review) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style=\"font-family: Arial, sans-serif;\">");
        html.append("<div style=\"max-width: 600px; margin: 0 auto;\">");
        html.append("<h2>New Review on Your Product</h2>");
        html.append("<p>A customer has left a review on your product:</p>");
        html.append("<table style=\"width: 100%; border-collapse: collapse;\">");
        html.append("<tr><th>Product</th><td>").append(review.getProduct().getName()).append("</td></tr>");
        html.append("<tr><th>Rating</th><td>").append(review.getRating()).append("/5 stars</td></tr>");
        html.append("<tr><th>Review</th><td>").append(review.getComment()).append("</td></tr>");
        html.append("</table>");
        html.append("<p>Log in to your admin panel to manage reviews.</p>");
        html.append("<p>Best regards,<br/>Fashionable Shop Team</p>");
        html.append("</div></body></html>");

        return html.toString();
    }

    /**
     * Build welcome HTML
     */
    private String buildWelcomeHtml(String fullName) {
        return "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<div style=\"max-width: 600px; margin: 0 auto;\">" +
                "<h2>Welcome to Fashionable Shop!</h2>" +
                "<p>Dear " + fullName + ",</p>" +
                "<p>Welcome! Your account has been created successfully.</p>" +
                "<p>You can now browse and purchase from our wide collection of fashion products.</p>" +
                "<p><a href=\"http://localhost:3000\" style=\"background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Start Shopping</a></p>" +
                "<p>Best regards,<br/>Fashionable Shop Team</p>" +
                "</div></body></html>";
    }

    /**
     * Build order cancellation HTML
     */
    private String buildOrderCancellationHtml(Order order) {
        return "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<div style=\"max-width: 600px; margin: 0 auto;\">" +
                "<h2>Order Cancelled</h2>" +
                "<p>Dear " + order.getUser().getFullName() + ",</p>" +
                "<p>Your order #" + order.getOrderCode() + " has been cancelled.</p>" +
                "<p>If you have any questions, please contact us.</p>" +
                "<p>Best regards,<br/>Fashionable Shop Team</p>" +
                "</div></body></html>";
    }
}
