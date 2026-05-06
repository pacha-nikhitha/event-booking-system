import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Clock, Users, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/events/public/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${id}`);
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!event) return <div className="container mt-4 text-center"><h2>Event not found</h2></div>;

  return (
    <div className="container mt-4 mb-4 animate-fade-in">
      <div className="event-details-header">
        <div className="event-details-image">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} />
          ) : (
            <div className="placeholder-details-image">
              <Calendar size={64} color="var(--border-color)" />
            </div>
          )}
        </div>
      </div>
      
      <div className="event-details-content card mt-4">
        <div className="details-main">
          <h1 className="details-title">{event.title}</h1>
          <p className="details-description">{event.description}</p>
        </div>
        
        <div className="details-sidebar">
          <div className="info-box">
            <h3>Event Info</h3>
            <div className="info-item">
              <Calendar className="info-icon" size={20} />
              <div>
                <span className="info-label">Date</span>
                <span className="info-value">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="info-item">
              <Clock className="info-icon" size={20} />
              <div>
                <span className="info-label">Time</span>
                <span className="info-value">{event.time}</span>
              </div>
            </div>
            <div className="info-item">
              <MapPin className="info-icon" size={20} />
              <div>
                <span className="info-label">Venue</span>
                <span className="info-value">{event.venue}</span>
              </div>
            </div>
            <div className="info-item">
              <Users className="info-icon" size={20} />
              <div>
                <span className="info-label">Availability</span>
                <span className="info-value">{event.availableSeats} / {event.totalSeats} seats left</span>
              </div>
            </div>
            <div className="info-item price-item">
              <IndianRupee className="info-icon" size={24} />
              <div>
                <span className="info-label">Price</span>
                <span className="info-value price-value">{event.basePrice}</span>
              </div>
            </div>
            
            <button 
              className="btn btn-primary w-100 mt-4 btn-book" 
              onClick={handleBookNow}
              disabled={event.availableSeats === 0}
            >
              {event.availableSeats === 0 ? 'Sold Out' : 'Book Tickets'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
