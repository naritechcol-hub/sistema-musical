// src/components/ProtectedRoute.jsx
// Guardia de sesión: redirige al login si no hay sm_usuario en sessionStorage
import { Navigate, Outlet } from 'react-router-dom'
import { estaAutenticado } from '../utils/session.js'

function ProtectedRoute() {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute