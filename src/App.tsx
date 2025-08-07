import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/ToastContainer';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import MyGigs from './pages/MyGigs';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import PaymentSuccess from './pages/PaymentSuccess';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import OrderMessages from './pages/OrderMessages';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Partnerships from './pages/Partnerships';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';

import NotFound from './pages/NotFound';

function AppContent() {
  const location = useLocation();
  const hideFooter = ['/login', '/register'].includes(location.pathname);
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/gigs/create" element={<CreateGig />} />
          <Route path="/gigs/:id/edit" element={<EditGig />} />
          <Route path="/my-gigs" element={<MyGigs />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id/messages" element={<OrderMessages />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
            <ToastContainer />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;