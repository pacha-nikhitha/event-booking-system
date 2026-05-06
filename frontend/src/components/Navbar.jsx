import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <Calendar color="var(--primary-color)" />
          <span>EventHub</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/">Events</Link>
          {user ? (
            <div className="nav-user">
              <Link to="/dashboard" className="btn-dashboard">
                <User size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-login">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
