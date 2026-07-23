import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppointmentModal from './components/AppointmentModal';
import ShareModal from './components/ShareModal';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import ConfirmationCenter from './pages/ConfirmationCenter';
import History from './pages/History';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Login from './pages/Login';
import API from './services/api';

function ProtectedLayout({ children, categories, onRefreshCategories, onOpenModal, onOpenShare }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onOpenShare={onOpenShare} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenNewEvent={() => onOpenModal()}
          onOpenShare={onOpenShare}
        />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function MainApp() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const handleOpenModal = (appt = null) => {
    setEditingAppt(appt);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAppt(null);
    setModalOpen(false);
  };

  const handleSaveAppointment = async (formData) => {
    try {
      if (editingAppt) {
        await API.put(`/appointments/${editingAppt.id}`, formData);
      } else {
        await API.post('/appointments', formData);
      }
      handleCloseModal();
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erro desconhecido ao salvar compromisso.';
      alert(`Erro ao salvar compromisso:\n${msg}`);
    }
  };

  const handleOpenShare = () => {
    setShareModalOpen(true);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedLayout categories={categories} onRefreshCategories={fetchCategories} onOpenModal={handleOpenModal} onOpenShare={handleOpenShare}>
            <Dashboard onOpenNewEvent={handleOpenModal} categories={categories} />
          </ProtectedLayout>
        } />

        <Route path="/calendar" element={
          <ProtectedLayout categories={categories} onRefreshCategories={fetchCategories} onOpenModal={handleOpenModal} onOpenShare={handleOpenShare}>
            <CalendarView onOpenNewEvent={handleOpenModal} categories={categories} />
          </ProtectedLayout>
        } />

        <Route path="/confirmations" element={
          <ProtectedLayout categories={categories} onRefreshCategories={fetchCategories} onOpenModal={handleOpenModal} onOpenShare={handleOpenShare}>
            <ConfirmationCenter />
          </ProtectedLayout>
        } />

        <Route path="/history" element={
          <ProtectedLayout categories={categories} onRefreshCategories={fetchCategories} onOpenModal={handleOpenModal} onOpenShare={handleOpenShare}>
            <History categories={categories} />
          </ProtectedLayout>
        } />

        <Route path="/admin" element={
          <ProtectedLayout categories={categories} onRefreshCategories={fetchCategories} onOpenModal={handleOpenModal} onOpenShare={handleOpenShare}>
            {user?.role === 'ADMIN' ? (
              <AdminPanel categories={categories} onCategoryUpdate={fetchCategories} />
            ) : (
              <Navigate to="/" replace />
            )}
          </ProtectedLayout>
        } />

        <Route path="/profile" element={
          <ProtectedLayout categories={categories} onRefreshCategories={fetchCategories} onOpenModal={handleOpenModal} onOpenShare={handleOpenShare}>
            <Profile />
          </ProtectedLayout>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Appointment Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
        initialData={editingAppt}
        categories={categories}
      />

      {/* Global Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
