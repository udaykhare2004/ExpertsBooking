import { Link, useLocation } from 'react-router-dom';
import { FaCalendarCheck, FaHome, FaBook } from 'react-icons/fa';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-xl border-b-4 border-purple-600 mb-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-3 text-2xl font-black text-purple-700">
            <FaCalendarCheck className="text-3xl" />
            <span className="tracking-tight uppercase">Expert Booking</span>
          </Link>

          <div className="flex gap-4">
            
            <Link
              to="/"
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 border-2 shadow-sm ${
                isActive('/')
                  ? 'bg-purple-700 text-white border-purple-800 font-black shadow-purple-200'
                  : 'bg-white text-black border-slate-900 font-black hover:text-white' 
              }`}
            >
              <FaHome className={`text-xl ${isActive('/') ? 'text-white' : 'text-purple-600'}`} />
              <span style={{color:'#1F2937'}}>EXPERTS</span>
            </Link>

            <Link
              to="/my-bookings"
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 border-2 shadow-sm ${
                isActive('/my-bookings')
                  ? 'bg-purple-700 text-white border-purple-800 font-black shadow-purple-200'
                  : 'bg-white text-black border-slate-900 font-black hover:text-white'
              }`}
            >
              <FaBook className={`text-xl ${isActive('/my-bookings') ? 'text-white' : 'text-purple-600'}`} />
              <span style={{color:'#1F2937'}}>MY BOOKINGS</span>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;