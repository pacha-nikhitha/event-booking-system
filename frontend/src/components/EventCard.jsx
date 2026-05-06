import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, IndianRupee } from 'lucide-react';
import './EventCard.css';

const EventCard = ({ event }) => {
  return (
    <div className="card event-card animate-fade-in">
      <div className="event-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <div className="placeholder-image">
            <CalendarIcon size={48} color="var(--border-color)" />
          </div>
        )}
        <div className="event-price">
          <IndianRupee size={14} /> {event.basePrice}
        </div>
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        
        <div className="event-details mb-3">
          <div className="detail-row">
            <CalendarIcon size={16} className="detail-icon" />
            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
          </div>
          <div className="detail-row">
            <MapPin size={16} className="detail-icon" />
            <span>{event.venue}</span>
          </div>
        </div>
        
        <p className="event-description">
          {event.description?.substring(0, 80)}...
        </p>
        
        <div className="event-footer mt-4">
          <div className="availability">
            <span className={event.availableSeats > 0 ? "text-success" : "text-danger"}>
              {event.availableSeats > 0 ? `${event.availableSeats} seats left` : 'Sold Out'}
            </span>
          </div>
          <Link to={`/events/${event.id}`} className="btn btn-primary">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
