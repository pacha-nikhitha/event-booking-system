package com.eventbooking.backend.controller;

import com.eventbooking.backend.dto.request.BookingRequest;
import com.eventbooking.backend.model.Booking;
import com.eventbooking.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest bookingRequest) {
        Booking booking = bookingService.createBooking(
                bookingRequest.getUserId(),
                bookingRequest.getEventId(),
                bookingRequest.getSeatCount(),
                bookingRequest.getTotalAmount()
        );
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingService.getBookingsByUser(userId);
    }
}
