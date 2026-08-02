import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

import Login from './pages/Login';
import StudentRegister from './pages/StudentRegister';
import FacultyRegister from './pages/FacultyRegister';
import VerifyOTP from './pages/VerifyOTP';

import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import HodDashboard from './pages/HodDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './Components/Footer';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user')) || null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

// Routes where Footer should appear
const PUBLIC_PATHS = ['/', '/about', '/contact', '/login', '/login/student', '/login/faculty', '/login/hod', '/login/admin', '/register/student', '/register/faculty', '/verify-email'];

function AppContent() {
  const location = useLocation();
  const showFooter = PUBLIC_PATHS.some(p =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );

  return (
    <div style={{ background: '#040a14', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      <Routes>

        {/* Public Routes (with Navbar) */}
        <Route element={<PublicLayout />}>
           <Route path="/" element={<Home />} />
           <Route path="/login" element={<Navigate to="/login/student" replace />} />
           <Route path="/about" element={<About />} />
           <Route path="/contact" element={<Contact />} />
           <Route path="/login/student" element={<Login role="student" />} />
           <Route path="/login/faculty" element={<Login role="faculty" />} />
           <Route path="/login/hod" element={<Login role="hod" />} />
           <Route path="/login/admin" element={<Login role="admin" />} />
           <Route path="/register/student" element={<StudentRegister />} />
           <Route path="/register/faculty" element={<FacultyRegister />} />
           <Route path="/verify-email" element={<VerifyOTP />} />
        </Route>

        {/* Protected Dashboard Routes (Standalone / No global Navbar or Footer) */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/faculty/*" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <Routes>
              <Route path="dashboard" element={<FacultyDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/hod/*" element={
          <ProtectedRoute allowedRoles={['hod']}>
            <Routes>
              <Route path="dashboard" element={<HodDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

      </Routes>

      {/* Footer only on public pages */}
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
