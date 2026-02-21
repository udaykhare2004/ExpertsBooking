import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaStar, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaGraduationCap, FaMapMarkerAlt, FaDollarSign, FaLanguage } from 'react-icons/fa';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});

  useEffect(() => {
    fetchExpert();
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('joinExpertRoom', id);
      socket.on('slotBooked', handleSlotBooked);
      socket.on('slotAvailable', handleSlotAvailable);
      socket.on('slotStatusUpdated', handleSlotStatusUpdated);

      return () => {
        socket.emit('leaveExpertRoom', id);
        socket.off('slotBooked', handleSlotBooked);
        socket.off('slotAvailable', handleSlotAvailable);
        socket.off('slotStatusUpdated', handleSlotStatusUpdated);
      };
    }
  }, [socket, id]);

  const fetchExpert = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/experts/${id}`);
      setExpert(response.data.data);
      organizeSlotsByDate(response.data.data.availableSlots);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch expert details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const organizeSlotsByDate = (slots) => {
    const organized = {};
    slots.forEach((slot) => {
      organized[slot.date] = slot.timeSlots;
    });
    setSlotsByDate(organized);
  };

  const handleSlotBooked = (data) => {
    if (String(data.expertId) === String(id)) {
      setSlotsByDate((prev) => {
        const updated = { ...prev };
        if (updated[data.date]) {
          updated[data.date] = updated[data.date].map((ts) => {
            if (
              ts.startTime === data.timeSlot.startTime &&
              ts.endTime === data.timeSlot.endTime
            ) {
              return { ...ts, isAvailable: false, status: 'Pending' };
            }
            return ts;
          });
        }
        return updated;
      });
      toast.success('A time slot was just booked!');
    }
  };

  const handleSlotAvailable = (data) => {
    if (String(data.expertId) === String(id)) {
      setSlotsByDate((prev) => {
        const updated = { ...prev };
        if (updated[data.date]) {
          updated[data.date] = updated[data.date].map((ts) => {
            if (
              ts.startTime === data.timeSlot.startTime &&
              ts.endTime === data.timeSlot.endTime
            ) {
              return { ...ts, isAvailable: true, status: 'Available' };
            }
            return ts;
          });
        }
        return updated;
      });
      toast.success('A time slot became available!');
    }
  };

  const handleSlotStatusUpdated = (data) => {
    if (String(data.expertId) === String(id)) {
      setSlotsByDate((prev) => {
        const updated = { ...prev };
        if (updated[data.date]) {
          updated[data.date] = updated[data.date].map((ts) => {
            if (
              ts.startTime === data.timeSlot.startTime &&
              ts.endTime === data.timeSlot.endTime
            ) {
              return { ...ts, status: data.status, isAvailable: data.status === 'Available' };
            }
            return ts;
          });
        }
        return updated;
      });
      toast.info(`Slot status updated to ${data.status}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSlotStatus = (slot) => {
    const status = slot.status || (slot.isAvailable ? 'Available' : 'Booked');
    switch (status) {
      case 'Available':
        return { text: 'Available', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'Pending':
        return { text: 'Pending', color: 'bg-orange-100 text-orange-800', icon: FaHourglassHalf };
      case 'Confirmed':
        return { text: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle };
      case 'Completed':
        return { text: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: FaCheckCircle };
      default:
        return { text: 'Unavailable', color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle };
    }
  };

  const handleSlotClick = (date, timeSlot) => {
    if (timeSlot.status !== 'Available') {
      toast.error('This time slot is not available for booking');
      return;
    }
    navigate(`/booking/${id}`, {
      state: {
        date,
        timeSlot: {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        }
      }
    });
  };

  const allSlots = [];
  Object.entries(slotsByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .forEach(([date, timeSlots]) => {
      timeSlots.forEach((slot) => {
        allSlots.push({ date, ...slot });
      });
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-700 text-lg">Loading expert details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-800 hover:text-purple-600 transition font-semibold"
        >
          <FaArrowLeft />
          Back to Expert List
        </button>

        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <h1 className="text-4xl font-bold mb-3">{expert.name}</h1>
          <div className="flex items-center gap-6 flex-wrap mb-4">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-semibold">
              {expert.category}
            </span>
            <span className="flex items-center gap-2 text-xl">
              <FaStar className="text-yellow-300" />
              <span className="font-bold">{expert.rating}/5</span>
            </span>
            <span className="text-lg opacity-95">
              {expert.experience} years experience
            </span>
          </div>
          {expert.bio && (
            <p className="text-lg opacity-95 leading-relaxed mb-4">{expert.bio}</p>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Expert Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {expert.specialization && expert.specialization.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.specialization.map((spec, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {expert.education && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FaGraduationCap className="text-purple-600" />
                  Education
                </h3>
                <p className="text-slate-700">{expert.education}</p>
              </div>
            )}

            {expert.location && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-purple-600" />
                  Location
                </h3>
                <p className="text-slate-700">{expert.location}</p>
              </div>
            )}

            {expert.languages && expert.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FaLanguage className="text-purple-600" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expert.languages.map((lang, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {expert.consultationFee !== undefined && expert.consultationFee > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FaDollarSign className="text-purple-600" />
                  Consultation Fee
                </h3>
                <p className="text-slate-700 text-xl font-bold">${expert.consultationFee}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-purple-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <FaCalendarAlt className="text-purple-600" />
            Available Time Slots
          </h2>

          {allSlots.length === 0 ? (
            <div className="text-center py-12">
              <FaTimesCircle className="text-slate-400 text-6xl mx-auto mb-4" />
              <p className="text-slate-700 text-lg">No available slots at the moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      <FaCalendarAlt className="inline mr-2 text-purple-600" />
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      <FaClock className="inline mr-2 text-purple-600" />
                      Time Slot
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allSlots.map((slot, index) => {
                    const status = getSlotStatus(slot);
                    const StatusIcon = status.icon;
                    const isAvailable = slot.status === 'Available';
                    
                    return (
                      <tr
                        key={index}
                        className={`border-b border-purple-100 transition ${
                          isAvailable ? 'hover:bg-green-50' : 'hover:bg-slate-50'
                        } ${!isAvailable ? 'opacity-75' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatDate(slot.date)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${
                            isAvailable ? 'text-slate-900' : 'text-slate-500'
                          }`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold ${status.color}`}>
                            <StatusIcon className="text-xs" />
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSlotClick(slot.date, slot)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                              isAvailable
                                ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shadow-sm'
                                : 'bg-slate-200 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            {isAvailable ? 'Book Now' : 'Unavailable'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpertDetail;
