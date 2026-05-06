import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, CreditCard, QrCode } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './BookingFlow.css';

const BookingFlow = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedBank, setSelectedBank] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Seat Simulation (in a real app, this would come from the backend)
  const totalRows = 5;
  const seatsPerRow = 10;
  const [bookedSeats] = useState(['A3', 'A4', 'B5', 'C1', 'C2', 'E8', 'E9', 'E10']);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/events/public/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    fetchEvent();
  }, [id]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a booking request to the backend
      const bookingData = {
        eventId: parseInt(id),
        userId: user.id,
        seats: selectedSeats,
        totalAmount: selectedSeats.length * event.basePrice,
        paymentMethod: paymentMethod
      };

      if (!token) {
        alert("Session expired. Please log out and log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8080/api/bookings/create', {
        userId: user.id,
        eventId: parseInt(id),
        seatCount: selectedSeats.length,
        totalAmount: selectedSeats.length * event.basePrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingResult({
        transactionId: response.data.transactionId,
        amount: response.data.totalAmount,
        seats: selectedSeats,
        eventName: event.title,
        date: response.data.bookingDate
      });
      setStep(3);
      setLoading(false);

    } catch (error) {
      console.error("Booking failed:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      alert(`Payment failed: ${errorMsg}. Please try logging out and logging back in.`);
      setLoading(false);
    }
  };

  const downloadTicketAsPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('ticket-download-card');
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Ticket_${bookingResult.transactionId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!event) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="container mt-4 mb-4">
      <div className="booking-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle">1</div>
          <span>Select Seats</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle">2</div>
          <span>Payment</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span>Ticket</span>
        </div>
      </div>

      <div className="card booking-content animate-fade-in">
        {step === 1 && (
          <div className="seat-selection-container">
            <h2 className="text-center mb-4">Select Your Seats for {event.title}</h2>
            
            <div className="screen-indicator">Screen</div>
            
            <div className="seats-grid">
              {Array.from({ length: totalRows }).map((_, rowIndex) => {
                const rowLabel = String.fromCharCode(65 + rowIndex);
                return (
                  <div key={rowLabel} className="seat-row">
                    <div className="row-label">{rowLabel}</div>
                    <div className="seats">
                      {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                        const seatId = `${rowLabel}${seatIndex + 1}`;
                        const isBooked = bookedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        
                        return (
                          <div 
                            key={seatId} 
                            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleSeat(seatId)}
                            title={isBooked ? 'Booked' : seatId}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="seat-legend mt-4 text-center">
              <span className="legend-item"><div className="seat"></div> Available</span>
              <span className="legend-item"><div className="seat selected"></div> Selected</span>
              <span className="legend-item"><div className="seat booked"></div> Booked</span>
            </div>

            <div className="booking-summary mt-4">
              <div className="summary-info">
                <span>Selected: {selectedSeats.length} seats ({selectedSeats.join(', ')})</span>
                <span className="total-price">Total: ₹{selectedSeats.length * event.basePrice}</span>
              </div>
              <button 
                className="btn btn-primary" 
                disabled={selectedSeats.length === 0}
                onClick={() => setStep(2)}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="payment-container">
            <h2 className="mb-4">Complete Payment</h2>
            <div className="payment-layout">
              <div className="payment-methods">
                <h3>Select Method</h3>
                <div 
                  className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={24} /> Credit/Debit Card
                </div>
                <div 
                  className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={24} /> UPI App
                </div>
                <div 
                  className={`payment-option ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <div className="bank-icon">🏦</div> Net Banking
                </div>
              </div>

              <div className="payment-details">
                <h3>Payment Details</h3>
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment} className="payment-form">
                    <div className="form-group mb-3">
                      <label>Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" required />
                    </div>
                    <div className="form-group mb-3 form-row">
                      <div className="col">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" required />
                      </div>
                      <div className="col">
                        <label>CVV</label>
                        <input type="text" placeholder="123" required />
                      </div>
                    </div>
                    <div className="form-group mb-4">
                      <label>Name on Card</label>
                      <input type="text" placeholder="John Doe" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? 'Processing...' : `Pay ₹${selectedSeats.length * event.basePrice}`}
                    </button>
                  </form>
                )}
                
                {paymentMethod === 'upi' && (
                  <div className="upi-payment text-center">
                    <div className="qr-placeholder">
                      <QrCode size={120} color="var(--primary-color)" />
                    </div>
                    <p className="mt-3 text-secondary">Scan QR code using any UPI app</p>
                    <button className="btn btn-primary mt-4 w-100" onClick={handlePayment} disabled={loading}>
                      {loading ? 'Processing...' : `Confirm Payment of ₹${selectedSeats.length * event.basePrice}`}
                    </button>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="netbanking-payment">
                    <div className="form-group mb-4">
                      <label>Select Your Bank</label>
                      <select 
                        className="form-control mt-2" 
                        style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }}
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        <option value="" disabled>Choose a bank...</option>
                        <option value="sbi">State Bank of India (SBI)</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                      </select>
                    </div>
                    
                    <button 
                      className="btn btn-primary mt-2 w-100" 
                      onClick={handlePayment} 
                      disabled={loading || !selectedBank}
                    >
                      {loading ? 'Processing...' : `Proceed to Pay ₹${selectedSeats.length * event.basePrice}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && bookingResult && (
          <div className="ticket-container text-center">
            <div className="success-icon mb-3">
              <CheckCircle size={64} color="var(--success-color)" />
            </div>
            <h2 className="mb-2">Booking Confirmed!</h2>
            <p className="text-secondary mb-4">Your tickets have been sent to your email.</p>

            <div className="ticket-card" id="ticket-download-card">
              <div className="ticket-header">
                <h3>{bookingResult.eventName}</h3>
                <p>Transaction ID: {bookingResult.transactionId}</p>
              </div>
              <div className="ticket-body">
                <div className="ticket-info">
                  <div className="info-block">
                    <span>Name</span>
                    <strong>{user.name}</strong>
                  </div>
                  <div className="info-block">
                    <span>Seats</span>
                    <strong>{bookingResult.seats.join(', ')}</strong>
                  </div>
                  <div className="info-block">
                    <span>Amount Paid</span>
                    <strong>₹{bookingResult.amount}</strong>
                  </div>
                </div>
                <div className="ticket-qr">
                  <QrCode size={100} color="#1e293b" />
                  <span>Scan to verify</span>
                </div>
              </div>
              <div className="ticket-cut"></div>
            </div>
            
            <div className="mt-4 flex-center gap-3">
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
              <button 
                className="btn" 
                onClick={downloadTicketAsPDF} 
                disabled={isDownloading}
                style={{border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)'}}
              >
                {isDownloading ? 'Generating PDF...' : 'Download Ticket PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
