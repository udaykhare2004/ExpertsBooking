import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import Navigation from './components/Navigation';
import ExpertList from './pages/ExpertList.jsx';
import ExpertDetail from './pages/ExpertDetail.jsx';
import Booking from './pages/Booking.jsx';
import MyBookings from './pages/MyBookings.jsx';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Navigation />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<ExpertList />} />
          <Route path="/expert/:id" element={<ExpertDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;