import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaStar, FaUserMd, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../utils/api';

function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6, 
    total: 0,
    pages: 0
  });

  const cardColors = [
    { bg: 'from-purple-600 to-indigo-700', text: 'text-white' },
    { bg: 'from-blue-600 to-cyan-700', text: 'text-white' },
    { bg: 'from-rose-600 to-pink-700', text: 'text-white' },
    { bg: 'from-emerald-600 to-teal-700', text: 'text-white' },
    { bg: 'from-indigo-600 to-violet-700', text: 'text-white' },
    { bg: 'from-slate-700 to-slate-900', text: 'text-white' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExperts();
  }, [pagination.page, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/experts/categories');
      setCategories(response.data.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;

      const response = await api.get('/experts', { params });
      setExperts(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages || 1 
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch experts';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchExperts();
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getTotalAvailableSlots = (expert) => {
    if (!expert.availableSlots || expert.availableSlots.length === 0) return 0;
    return expert.availableSlots.reduce((total, slot) => {
      return total + (slot.timeSlots ? slot.timeSlots.filter(ts => ts.status === 'Available').length : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            <FaUserMd className="text-purple-600" />
            Expert Directory
          </h1>
          <p className="text-slate-600 text-lg">Find and book appointments with our top-rated professionals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FaSearch className="text-purple-500" /> Search by Name
              </label>
              <input
                type="text"
                placeholder="Ex: Dr. Smith..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FaFilter className="text-purple-500" /> Category
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition appearance-none"
              >
                <option value="">All Specialities</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="submit" className="flex-1 md:flex-none px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold shadow-md">
                Search
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 italic font-bold text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
            Loading...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {experts.map((expert, index) => {
                const theme = cardColors[index % cardColors.length];
                const slots = getTotalAvailableSlots(expert);
                return (
                  <div key={expert._id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">
                    <div className={`bg-gradient-to-br ${theme.bg} p-6 ${theme.text}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase">{expert.category}</div>
                        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-md">
                          <FaStar className="text-yellow-400" />
                          <span className="font-bold text-sm">{expert.rating}</span>
                        </div>
                      </div>
                      <Link to={`/expert/${expert._id}`}>
                        <h3 className="text-2xl font-bold mb-1 hover:underline">{expert.name}</h3>
                      </Link>
                      <p className="text-sm opacity-90 mb-4">{expert.experience} Years Experience</p>
                      <div className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-black shadow-lg inline-block">
                        {slots > 0 ? `${slots} SLOTS AVAILABLE` : 'NO SLOTS LEFT'}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                        {expert.bio || "No biography provided."}
                      </p>
                      <div className="mt-auto">
                        <Link to={`/expert/${expert._id}`} className="block w-full text-center py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors">
                          View Profile & Book
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {experts.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4 mb-10">
                <p className="text-sm font-bold text-slate-500">
                  Showing <span className="text-slate-900">{experts.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 px-4 rounded-lg border border-slate-200 disabled:opacity-30 font-bold text-sm flex items-center gap-2"
                  >
                    <FaChevronLeft size={12} /> Prev
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition ${
                          pagination.page === i + 1 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'hover:bg-slate-100 text-slate-600 border border-slate-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 px-4 rounded-lg border border-slate-200 disabled:opacity-30 font-bold text-sm flex items-center gap-2"
                  >
                    Next <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExpertList;