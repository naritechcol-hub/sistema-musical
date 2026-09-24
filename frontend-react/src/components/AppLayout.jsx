// src/components/AppLayout.jsx
// Estructura de las pantallas autenticadas: topbar + sidebar + contenido
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar.jsx'
import Sidebar from './Sidebar.jsx'
import PageFooter from './PageFooter.jsx'
import '../styles/app.css'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sm-app">
      <Topbar onMenu={() => setSidebarOpen(o => !o)} />
      <div className="sm-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="sm-content" role="main">
          <Outlet />
        </main>
      </div>
      <PageFooter />
    </div>
  );
}

export default AppLayout