package com.eventbooking.backend.controller;

import com.eventbooking.backend.model.Event;
import com.eventbooking.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping("/public/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/category/{categoryId}")
    public List<Event> getEventsByCategory(@PathVariable Long categoryId) {
        return eventService.getEventsByCategory(categoryId);
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Event createEvent(@RequestBody Event event, @RequestParam Long categoryId, @RequestParam Long organizerId) {
        return eventService.createEvent(event, categoryId, organizerId);
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails, @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDetails, categoryId));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }
}
