import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/signin', {
        email,
        password
      });
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signin', {
        email: 'admin@eventhub.com',
        password: 'admin123'
      });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Admin demo login failed. Ensure the backend DataInitializer has run.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <div className="auth-header text-center mb-4">
          <div className="icon-wrapper">
            <LogIn size={32} color="var(--primary-color)" />
          </div>
          <h2>Welcome Back</h2>
          <p className="text-secondary">Sign in to book your next experience</p>
        </div>

        {error && <div className="error-message mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>
          
          <button 
            type="button" 
            className="btn w-100 mb-3" 
            onClick={handleAdminDemoLogin}
            disabled={loading}
            style={{ 
              backgroundColor: 'transparent', 
              border: '1px solid var(--accent-color)', 
              color: 'var(--accent-color)' 
            }}
          >
            Login as Admin (Demo)
          </button>
        </form>

        <p className="text-center text-secondary">
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
