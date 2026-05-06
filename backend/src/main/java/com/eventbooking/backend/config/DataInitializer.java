package com.eventbooking.backend.config;

import com.eventbooking.backend.model.Category;
import com.eventbooking.backend.model.Event;
import com.eventbooking.backend.model.Role;
import com.eventbooking.backend.model.User;
import com.eventbooking.backend.repository.CategoryRepository;
import com.eventbooking.backend.repository.EventRepository;
import com.eventbooking.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   CategoryRepository categoryRepository,
                                   EventRepository eventRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            User admin = userRepository.findByEmail("admin@eventhub.com").orElse(null);
            
            if (admin == null) {
                // Create Admin User
                admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@eventhub.com");
                admin.setPhone("9999999999");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ROLE_ADMIN);
                userRepository.save(admin);
                System.out.println("Admin demo account created!");
            }

            if (eventRepository.count() == 0) {
                // Create Categories
                Category music = new Category(null, "Music Concerts", "Live music events");
                Category tech = new Category(null, "Tech Conferences", "Technology and innovation summits");
                Category sports = new Category(null, "Sports", "Live sporting events and matches");
                Category arts = new Category(null, "Arts & Theatre", "Standup comedy, plays, and art exhibitions");
                
                categoryRepository.saveAll(Arrays.asList(music, tech, sports, arts));

                // Create Events
                List<Event> events = Arrays.asList(
                    createEvent("Summer Music Festival 2026", "A grand summer festival featuring top artists from around the world.", 
                        LocalDate.now().plusDays(15), LocalTime.of(18, 0), "Central Park Arena", music, admin, 
                        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop", 2500.0, 500),
                        
                    createEvent("Global Tech Summit", "Join the leading minds in AI, Web3, and Cloud computing.", 
                        LocalDate.now().plusDays(20), LocalTime.of(9, 0), "Silicon Valley Convention Center", tech, admin, 
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop", 5000.0, 300),
                        
                    createEvent("Championship Finals", "The ultimate showdown between the top two teams of the season.", 
                        LocalDate.now().plusDays(30), LocalTime.of(19, 30), "National Stadium", sports, admin, 
                        "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop", 1500.0, 1000),
                        
                    createEvent("Standup Comedy Night", "Laugh out loud with the best comedians in the country.", 
                        LocalDate.now().plusDays(5), LocalTime.of(20, 0), "Laugh Factory Downtown", arts, admin, 
                        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1000&auto=format&fit=crop", 800.0, 150),
                        
                    createEvent("Jazz Under the Stars", "A mesmerizing evening of smooth jazz.", 
                        LocalDate.now().plusDays(10), LocalTime.of(19, 0), "Botanical Gardens", music, admin, 
                        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop", 1200.0, 200),
                        
                    createEvent("React Developer Conference", "Everything new in the React ecosystem.", 
                        LocalDate.now().plusDays(40), LocalTime.of(10, 0), "Grand Hotel Expo", tech, admin, 
                        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1000&auto=format&fit=crop", 3000.0, 400),
                        
                    createEvent("Modern Art Exhibition", "Explore contemporary masterpieces.", 
                        LocalDate.now().plusDays(12), LocalTime.of(11, 0), "City Art Gallery", arts, admin, 
                        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1000&auto=format&fit=crop", 500.0, 100),
                        
                    createEvent("Marathon 2026", "Annual city marathon for all age groups.", 
                        LocalDate.now().plusDays(25), LocalTime.of(6, 0), "City Square", sports, admin, 
                        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000&auto=format&fit=crop", 1000.0, 2000),
                        
                    createEvent("Rock Band Live", "Your favorite rock band performing their greatest hits.", 
                        LocalDate.now().plusDays(18), LocalTime.of(21, 0), "O2 Arena", music, admin, 
                        "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=1000&auto=format&fit=crop", 3500.0, 800),
                        
                    createEvent("AI Revolution Workshop", "Hands-on workshop on generative AI.", 
                        LocalDate.now().plusDays(8), LocalTime.of(14, 0), "Tech Hub", tech, admin, 
                        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop", 2000.0, 50),
                        
                    createEvent("Classical Symphony", "Experience the magic of Beethoven and Mozart.", 
                        LocalDate.now().plusDays(35), LocalTime.of(18, 30), "Royal Opera House", arts, admin, 
                        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop", 4000.0, 300),
                        
                    createEvent("Basketball League Semi-Finals", "High stakes basketball match.", 
                        LocalDate.now().plusDays(22), LocalTime.of(20, 0), "Indoor Arena", sports, admin, 
                        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000&auto=format&fit=crop", 1800.0, 1500)
                );
                
                eventRepository.saveAll(events);
                System.out.println("Sample events have been loaded into the database!");
            }
        };
    }

    private Event createEvent(String title, String description, LocalDate date, LocalTime time, String venue, 
                              Category category, User organizer, String imageUrl, double price, int seats) {
        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setDate(date);
        event.setTime(time);
        event.setVenue(venue);
        event.setCategory(category);
        event.setOrganizer(organizer);
        event.setImageUrl(imageUrl);
        event.setBasePrice(BigDecimal.valueOf(price));
        event.setTotalSeats(seats);
        event.setAvailableSeats(seats);
        return event;
    }
}
