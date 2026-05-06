package com.eventbooking.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendBookingConfirmation(String toEmail, String userName, String eventTitle, String transactionId, String amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Booking Confirmed: " + eventTitle);
        message.setText("Dear " + userName + ",\n\n" +
                "Your booking for the event '" + eventTitle + "' has been confirmed!\n\n" +
                "Booking Details:\n" +
                "Transaction ID: " + transactionId + "\n" +
                "Amount Paid: ₹" + amount + "\n\n" +
                "Thank you for booking with EventHub!\n\n" +
                "Best regards,\n" +
                "EventHub Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
