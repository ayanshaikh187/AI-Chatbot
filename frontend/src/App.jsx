import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-center"><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" replace />;
}
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-center"><div className="spinner"/></div>;
  return user ? <Navigate to="/chat" replace /> : children;
}
export default function App() {
  return <AuthProvider><Routes>
    <Route path="/" element={<Navigate to="/chat" replace />} />
    <Route path="/login" element={<Public><Login/></Public>} />
    <Route path="/register" element={<Public><Register/></Public>} />
    <Route path="/chat" element={<Protected><Chat/></Protected>} />
    <Route path="/profile" element={<Protected><Profile/></Protected>} />
    <Route path="*" element={<Navigate to="/chat" replace />} />
  </Routes></AuthProvider>;
}
