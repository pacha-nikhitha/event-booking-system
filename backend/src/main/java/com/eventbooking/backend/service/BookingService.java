package com.eventbooking.backend.service;

import com.eventbooking.backend.model.Booking;
import com.eventbooking.backend.model.BookingStatus;
import com.eventbooking.backend.model.Event;
import com.eventbooking.backend.model.User;
import com.eventbooking.backend.repository.BookingRepository;
import com.eventbooking.backend.repository.EventRepository;
import com.eventbooking.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Transactional
    public Booking createBooking(Long userId, Long eventId, int seatCount, BigDecimal totalAmount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getAvailableSeats() < seatCount) {
            throw new RuntimeException("Not enough seats available");
        }

        // Update available seats
        event.setAvailableSeats(event.getAvailableSeats() - seatCount);
        eventRepository.save(event);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        Booking savedBooking = bookingRepository.save(booking);

        // Send email confirmation
        try {
            emailService.sendBookingConfirmation(
                user.getEmail(), 
                user.getName(), 
                event.getTitle(), 
                savedBooking.getTransactionId(), 
                savedBooking.getTotalAmount().toString()
            );
        } catch (Exception e) {
            // Log the error but don't fail the booking
            System.err.println("Email notification failed: " + e.getMessage());
        }

        return savedBooking;
    }
}
