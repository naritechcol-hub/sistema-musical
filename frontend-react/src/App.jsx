import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegistroPage from './pages/RegistroPage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import DashboardHome from './pages/DashboardHome.jsx'
import CancionesPage from './pages/CancionesPage.jsx'
import UsuariosPage from './pages/UsuariosPage.jsx'
import AuditoriaPage from './pages/AuditoriaPage.jsx'
import PerfilPage from './pages/PerfilPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/error" element={<ErrorPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/canciones" element={<CancionesPage />} />
          <Route path="/dashboard/usuarios" element={<UsuariosPage />} />
          <Route path="/dashboard/auditoria" element={<AuditoriaPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App