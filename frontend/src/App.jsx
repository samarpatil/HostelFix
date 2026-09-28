import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import Login from './pages/public/Login';
import StudentProfile from './pages/student/Profile';
import CreateComplaint from './pages/student/CreateComplaint';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetails from './pages/student/ComplaintDetails';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Student routes */}
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute requiredRole="student">
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints/create"
          element={
            <ProtectedRoute requiredRole="student">
              <CreateComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/complaints/:complaintId"
          element={
            <ProtectedRoute requiredRole="student">
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login or profile based on auth */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
