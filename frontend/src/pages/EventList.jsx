import { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { Search } from 'lucide-react';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/events/public/all');
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4 mb-4">
      <div className="hero-section text-center animate-fade-in">
        <h1 className="hero-title">Discover Amazing Events</h1>
        <p className="hero-subtitle">Book tickets for concerts, workshops, and more.</p>
        
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search events by title or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <h2 className="section-title">Upcoming Events</h2>
      
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="empty-state text-center card">
          <p>No events found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
