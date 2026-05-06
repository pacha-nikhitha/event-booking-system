package com.eventbooking.backend.service;

import com.eventbooking.backend.model.Category;
import com.eventbooking.backend.model.Event;
import com.eventbooking.backend.model.User;
import com.eventbooking.backend.repository.CategoryRepository;
import com.eventbooking.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.eventbooking.backend.repository.UserRepository userRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public List<Event> getEventsByCategory(Long categoryId) {
        return eventRepository.findByCategoryId(categoryId);
    }

    public Event createEvent(Event event, Long categoryId, Long organizerId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        event.setCategory(category);
        event.setOrganizer(organizer);
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails, Long categoryId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            event.setCategory(category);
        }

        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setDate(eventDetails.getDate());
        event.setTime(eventDetails.getTime());
        event.setVenue(eventDetails.getVenue());
        event.setBasePrice(eventDetails.getBasePrice());
        event.setTotalSeats(eventDetails.getTotalSeats());
        event.setAvailableSeats(eventDetails.getAvailableSeats());
        event.setImageUrl(eventDetails.getImageUrl());

        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        eventRepository.delete(event);
    }
}
