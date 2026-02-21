import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaClock, FaStickyNote } from 'react-icons/fa';
import api from '../utils/api';

function Booking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: location.state?.date || '',
    timeSlot: location.state?.timeSlot || { startTime: '', endTime: '' },
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchExpert();
    // Safety: If no date/time was selected, send them back to pick one
    if (!location.state?.date) {
        toast.error("Please select a time slot first");
        navigate(`/expert/${id}`);
    }
  }, [id]);

  const fetchExpert = async () => {
    try {
      const response = await api.get(`/experts/${id}`);
      setExpert(response.data.data);
    } catch (err) {
      toast.error('Failed to load expert details');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.timeSlot.startTime) newErrors.timeSlot = 'Time slot is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        expert: id, 
        ...formData,
        email: formData.email.toLowerCase().trim()
      };

      await api.post('/bookings', payload);

      toast.success('Booking created successfully!');
      
      setTimeout(() => {
        navigate('/my-bookings', { 
            state: { email: formData.email.toLowerCase().trim() } 
        });
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-950 hover:text-purple-600 transition font-black text-lg"
        >
          <FaArrowLeft /> BACK
        </button>

        <h1 className="text-4xl font-black text-slate-950 mb-2 uppercase tracking-tight italic">Confirm Booking</h1>
        <p className="text-slate-600 mb-8 font-bold">You are booking a session with {expert?.name || 'the expert'}</p>

        {expert && (
          <div className="bg-slate-900 rounded-3xl shadow-xl p-8 mb-8 text-white border-l-[12px] border-purple-600">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black mb-1">{expert.name}</h2>
                    <p className="text-purple-400 font-black mb-6 uppercase tracking-widest text-sm">{expert.category}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Fee</p>
                    <p className="text-2xl font-black text-white">${expert.consultationFee || '0'}</p>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl font-black border border-white/5">
                  <FaCalendarAlt className="text-purple-400" /> {formData.date}
               </span>
               <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl font-black border border-white/5">
                  <FaClock className="text-purple-400" /> {formData.timeSlot.startTime} - {formData.timeSlot.endTime}
               </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl p-10 border-2 border-slate-200 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0 opacity-50"></div>

          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-6 font-black uppercase text-sm">
              {errors.submit}
            </div>
          )}

          <div className="space-y-6 relative z-10">
            {[
              { label: 'Full Name', name: 'name', type: 'text', icon: <FaUser /> },
              { label: 'Email Address', name: 'email', type: 'email', icon: <FaEnvelope /> },
              { label: 'Phone Number', name: 'phone', type: 'tel', icon: <FaPhone /> }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-slate-950 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="text-purple-600">{field.icon}</span> {field.label} *
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  autoComplete="off"
                  className={`w-full px-5 py-4 border-2 rounded-2xl font-bold text-slate-950 bg-slate-50 transition-all outline-none ${
                    errors[field.name] ? 'border-red-500' : 'border-slate-200 focus:border-purple-600 focus:bg-white'
                  }`}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                />
                {errors[field.name] && <p className="text-red-600 text-xs font-black mt-2 uppercase">{errors[field.name]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-slate-950 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <FaStickyNote className="text-purple-600" /> Notes for the expert
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-950 bg-slate-50 focus:border-purple-600 focus:bg-white transition-all outline-none"
                placeholder="Briefly describe what you'd like to discuss..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-purple-600 text-white rounded-2xl font-black text-2xl hover:bg-purple-700 transition shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM & BOOK NOW'}
            </button>
            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-tighter">By clicking confirm, you agree to our terms of service</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;