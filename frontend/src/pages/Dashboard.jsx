import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Ticket, Download, Plus, Users, IndianRupee, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    basePrice: '',
    totalSeats: '',
    imageUrl: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user.role === 'ROLE_ADMIN' && activeTab === 'manage') {
        const [eventsRes, catsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/events/public/all'),
          axios.get('http://localhost:8080/api/categories/public/all')
        ]);
        setEvents(eventsRes.data);
        setCategories(catsRes.data);
      } else if (activeTab === 'tickets' || activeTab === 'overview') {
        const bookingsRes = await axios.get(`http://localhost:8080/api/bookings/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      basePrice: event.basePrice,
      totalSeats: event.totalSeats,
      imageUrl: event.imageUrl || '',
      categoryId: event.category?.id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:8080/api/events/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(events.filter(e => e.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert("Authentication token missing. Please log out and log in again.");
      setLoading(false);
      return;
    }

    if (!formData.categoryId && !currentEvent) {
      alert("Please select a category.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Clean and format the payload
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        imageUrl: formData.imageUrl,
        basePrice: parseFloat(formData.basePrice),
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: currentEvent ? currentEvent.availableSeats : parseInt(formData.totalSeats)
      };

      if (currentEvent) {
        await axios.put(`http://localhost:8080/api/events/admin/${currentEvent.id}?categoryId=${formData.categoryId}`, payload, config);
      } else {
        await axios.post(`http://localhost:8080/api/events/admin/create?categoryId=${formData.categoryId}&organizerId=${user.id}`, payload, config);
      }
      
      setShowModal(false);
      fetchData();
      alert(currentEvent ? "Event updated successfully!" : "Event created successfully!");
    } catch (error) {
      console.error("Error saving event:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      alert(`Failed to save event: ${JSON.stringify(errorMsg)}. Check console for full details.`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (elementId, filename) => {
    setIsDownloading(true);
    const element = document.getElementById(elementId);
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Dummy data for Admin Analytics
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  const categoryData = [
    { name: 'Concerts', value: 400 },
    { name: 'Workshops', value: 300 },
    { name: 'Sports', value: 300 },
    { name: 'Comedy', value: 200 },
  ];
  const COLORS = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b'];

  if (!user) return <div className="container mt-4 text-center">Loading...</div>;

  return (
    <div className="container mt-4 mb-4 dashboard-container animate-fade-in">
      <div className="dashboard-sidebar card">
        <div className="user-profile mb-4">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <h3>{user.name}</h3>
            <span className="role-badge">{user.role === 'ROLE_ADMIN' ? 'Administrator' : 'User'}</span>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <Calendar size={18} /> Overview
          </li>
          
          {user.role === 'ROLE_ADMIN' && (
            <>
              <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                <IndianRupee size={18} /> Analytics
              </li>
              <li className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>
                <Edit size={18} /> Manage Events
              </li>
            </>
          )}

          {user.role === 'ROLE_USER' && (
            <li className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
              <Ticket size={18} /> My Tickets
            </li>
          )}
        </ul>
      </div>

      <div className="dashboard-content card">
        {activeTab === 'overview' && (
          <div>
            <h2 className="mb-4">Welcome back, {user.name.split(' ')[0]}!</h2>
            
            {user.role === 'ROLE_ADMIN' ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><IndianRupee size={24} /></div>
                  <div className="stat-details">
                    <span className="stat-label">Total Revenue</span>
                    <h3 className="stat-value">₹1,24,500</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Ticket size={24} /></div>
                  <div className="stat-details">
                    <span className="stat-label">Tickets Sold</span>
                    <h3 className="stat-value">845</h3>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Users size={24} /></div>
                  <div className="stat-details">
                    <span className="stat-label">Total Users</span>
                    <h3 className="stat-value">3,240</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="user-overview">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon"><Ticket size={24} /></div>
                    <div className="stat-details">
                      <span className="stat-label">Total Bookings</span>
                      <h3 className="stat-value">{bookings.length}</h3>
                    </div>
                  </div>
                </div>
                
                <h3 className="mt-4 mb-3">Recent Bookings</h3>
                <div className="bookings-list">
                  {bookings.length > 0 ? bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="booking-item">
                      <div className="booking-info">
                        <h4>{booking.event.title}</h4>
                        <span className="text-secondary">{new Date(booking.event.date).toLocaleDateString()} • ₹{booking.totalAmount}</span>
                      </div>
                      <div className="booking-actions">
                        <span className="status-badge success">{booking.status}</span>
                      </div>
                    </div>
                  )) : <p className="text-secondary">No bookings found.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && user.role === 'ROLE_ADMIN' && (
          <div>
            <h2 className="mb-4">Revenue & Analytics</h2>
            <div className="charts-grid">
              <div className="chart-container">
                <h3 className="chart-title">Revenue (Last 6 Months)</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                      <Bar dataKey="revenue" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-container">
                <h3 className="chart-title">Sales by Category</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && user.role === 'ROLE_ADMIN' && (
          <div>
            <div className="flex-between mb-4">
              <h2>Manage Events</h2>
              <button className="btn btn-primary" onClick={() => { setCurrentEvent(null); setFormData({ title: '', description: '', date: '', time: '', venue: '', basePrice: '', totalSeats: '', imageUrl: '', categoryId: '' }); setShowModal(true); }}><Plus size={18} /> Add Event</button>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Price</th>
                    <th>Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{event.date}</td>
                      <td>{event.venue}</td>
                      <td>₹{event.basePrice}</td>
                      <td>{event.availableSeats}/{event.totalSeats}</td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit" onClick={() => handleEdit(event)}><Edit size={16} /></button>
                          <button className="action-btn delete" onClick={() => handleDelete(event.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && user.role === 'ROLE_USER' && (
          <div>
            <h2 className="mb-4">My Tickets & Certificates</h2>
            <div className="bookings-list">
              {bookings.map(booking => {
                const isPast = new Date(booking.event.date) < new Date();
                const ticketId = `ticket-${booking.id}`;
                return (
                  <div key={booking.id} className="booking-item-container">
                    <div className="booking-item">
                      <div className="booking-info">
                        <h4>{booking.event.title}</h4>
                        <span className="text-secondary">{booking.event.date} • {booking.event.venue}</span>
                      </div>
                      <div className="booking-actions">
                        {!isPast ? (
                          <button className="btn btn-primary btn-sm" onClick={() => downloadPDF(ticketId, `Ticket_${booking.transactionId}.pdf`)} disabled={isDownloading}>
                            <Download size={14} /> {isDownloading ? 'Downloading...' : 'E-Ticket'}
                          </button>
                        ) : (
                          <button className="btn btn-outline-sm" onClick={() => downloadPDF(ticketId, `Certificate_${booking.transactionId}.pdf`)} disabled={isDownloading}>
                            <Download size={14} /> {isDownloading ? 'Downloading...' : 'E-Certificate'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Hidden Template for PDF Generation */}
                    <div style={{ position: 'absolute', left: '-9999px' }}>
                      <div id={ticketId} className="pdf-template">
                        <div className="pdf-header">
                          <h1>{isPast ? 'Participation Certificate' : 'Event Ticket'}</h1>
                          <p>{booking.event.title}</p>
                        </div>
                        <div className="pdf-body">
                          <p><strong>Name:</strong> {user.name}</p>
                          <p><strong>Date:</strong> {booking.event.date} at {booking.event.time}</p>
                          <p><strong>Venue:</strong> {booking.event.venue}</p>
                          <p><strong>Transaction ID:</strong> {booking.transactionId}</p>
                          {isPast && <p className="mt-4 text-center"><em>Thank you for attending our event!</em></p>}
                        </div>
                        <div className="pdf-footer">
                          <p>Generated by EventHub</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Event */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>{currentEvent ? 'Edit Event' : 'Add New Event'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} required={!currentEvent}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Venue</label>
                  <input type="text" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Base Price</label>
                  <input type="number" value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input type="number" value={formData.totalSeats} onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
              </div>
              <div className="form-group mt-3">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
              </div>
              <div className="modal-footer mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
