import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <div className="auth-header text-center mb-4">
          <div className="icon-wrapper">
            <User size={32} color="var(--primary-color)" />
          </div>
          <h2>Create Account</h2>
          <p className="text-secondary">Join us to discover amazing events</p>
        </div>

        {error && <div className="error-message mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={20} className="input-icon" />
              <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Phone Number</label>
            <div className="input-with-icon">
              <Phone size={20} className="input-icon" />
              <input type="tel" name="phone" placeholder="+1 234 567 890" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group mb-4">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-secondary">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
