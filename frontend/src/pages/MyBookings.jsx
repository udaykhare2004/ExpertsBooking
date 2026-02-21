import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSearch, FaEnvelope } from 'react-icons/fa';
import api from '../utils/api';

function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchEmail, setSearchEmail] = useState(location.state?.email || '');

  useEffect(() => {
    if (searchEmail) fetchBookings(searchEmail);
  }, []);

  const fetchBookings = async (emailToSearch) => {
    if (!emailToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/bookings', {
        params: { email: emailToSearch.toLowerCase().trim() }
      });
      setBookings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Confirmed: 'bg-green-100 text-green-800 border-green-300',
      Pending: 'bg-orange-100 text-orange-800 border-orange-300',
      Cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase italic">My Bookings</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-slate-200">
          <form onSubmit={(e) => { e.preventDefault(); fetchBookings(searchEmail); }} className="flex gap-4">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-600 outline-none font-bold"
              />
            </div>
            <button type="submit" className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-700 transition flex items-center gap-2">
              <FaSearch /> SEARCH
            </button>
          </form>
        </div>

        {!loading && bookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-4 text-xs font-black uppercase">Expert</th>
                  <th className="px-6 py-4 text-xs font-black uppercase">Appointment</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-right">Booked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => {
                  console.log(booking)
                  return (
                  <tr key={booking._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-950 text-lg">
                          {booking.expert && typeof booking.expert === 'object' 
                            ? booking.expert.name 
                            : "Expert Name Missing"}
                        </span>
                        <span className="text-sm font-bold text-purple-600 uppercase tracking-tight">
                          {booking.expert && typeof booking.expert === 'object' 
                            ? booking.expert.category 
                            : "General"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-slate-700">{booking.date}</div>
                      <div className="text-xs font-black text-slate-400 uppercase">
                        {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right text-xs font-bold text-slate-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );  
              })}
              </tbody>
            </table>
          </div>
        )}

        {loading && <div className="text-center py-20 font-black text-slate-400 animate-pulse">LOADING YOUR APPOINTMENTS...</div>}
        {!loading && bookings.length === 0 && searchEmail && !error && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 font-bold text-slate-400">
                No bookings found for this email.
            </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;