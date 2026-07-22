import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
  Tooltip, Badge, Box, Popover, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { Icon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

  const [anchorUser, setAnchorUser] = useState(null);
  const [anchorNotif, setAnchorNotif] = useState(null);

  const notifications = [
    { id: 1, title: 'Lembrete das 07:00', text: 'Compromisso com Reunião de Alinhamento hoje às 09:00.' },
    { id: 2, title: 'Notificação de Sistema', text: 'Disparo de confirmações diárias efetuado com sucesso.' }
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton edge="start" onClick={onToggleSidebar} color="inherit" aria-label="menu">
            <Icon name="menu" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 36, height: 36, borderRadius: '12px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              AI
            </Box>
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6750A4 0%, #1E88E5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Agenda Inteligente
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Dark / Light Toggle */}
          <Tooltip title={`Alternar para tema ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Icon name="light_mode" color="#FFD54F" /> : <Icon name="dark_mode" color="#6750A4" />}
            </IconButton>
          </Tooltip>

          {/* Notifications Popover */}
          <Tooltip title="Notificações">
            <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)} color="inherit">
              <Badge badgeContent={notifications.length} color="error">
                <Icon name="notifications" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Popover
            open={Boolean(anchorNotif)}
            anchorEl={anchorNotif}
            onClose={() => setAnchorNotif(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 320, borderRadius: '16px', p: 1 } }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, p: 1 }}>
              🔔 Notificações do Dia
            </Typography>
            <Divider />
            <List dense>
              {notifications.map((n) => (
                <ListItem key={n.id}>
                  <ListItemText primary={n.title} secondary={n.text} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
          </Popover>

          {/* User Menu */}
          <Tooltip title="Sua Conta">
            <IconButton onClick={(e) => setAnchorUser(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar src={user?.photo} alt={user?.name} sx={{ width: 38, height: 38, border: '2px solid #6750A4' }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorUser}
            open={Boolean(anchorUser)}
            onClose={() => setAnchorUser(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { borderRadius: '16px', minWidth: 200, p: 1 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => { setAnchorUser(null); navigate('/profile'); }}>
              <Icon name="settings" sx={{ mr: 1.5 }} /> Perfil e Configurações
            </MenuItem>
            {user?.role === 'ADMIN' && (
              <MenuItem onClick={() => { setAnchorUser(null); navigate('/admin'); }}>
                <Icon name="dashboard" sx={{ mr: 1.5, color: 'primary.main' }} /> Painel Admin
              </MenuItem>
            )}
            <MenuItem onClick={() => { setAnchorUser(null); logout(); navigate('/login'); }} sx={{ color: 'error.main' }}>
              <Icon name="logout" sx={{ mr: 1.5 }} /> Sair da Conta
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
