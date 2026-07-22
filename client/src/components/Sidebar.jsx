import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Chip
} from '@mui/material';
import { Icon } from './Icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

export default function Sidebar({ open, onClose, variant = 'temporary', onOpenNewEvent }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <Icon name="dashboard" /> },
    { text: 'Calendário', path: '/calendar', icon: <Icon name="calendar_month" /> },
    { text: 'Confirmação dos Eventos', path: '/confirmations', icon: <Icon name="check_circle_outline" />, badge: 'Hoje' },
    { text: 'Histórico & Pesquisa', path: '/history', icon: <Icon name="history" /> },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ text: 'Painel Admin', path: '/admin', icon: <Icon name="admin_panel_settings" /> });
  }

  menuItems.push({ text: 'Perfil & Ajustes', path: '/profile', icon: <Icon name="person" /> });

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Quick Add Button */}
      <Box sx={{ mb: 3, mt: 1 }}>
        <ListItemButton
          onClick={onOpenNewEvent}
          sx={{
            borderRadius: '28px',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 1.5,
            px: 3,
            boxShadow: '0px 4px 12px rgba(103, 80, 164, 0.3)',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <Icon name="add" />
          </ListItemIcon>
          <ListItemText primary="Novo Compromisso" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }} />
        </ListItemButton>
      </Box>

      <Typography variant="caption" sx={{ px: 2, pb: 1, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Menu Principal
      </Typography>

      <List disablePadding>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  if (variant === 'temporary') onClose();
                }}
                sx={{
                  borderRadius: '16px',
                  py: 1.2,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 700 : 500 }} />
                {item.badge && (
                  <Chip label={item.badge} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', pt: 2, textAlign: 'center' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Agenda Inteligente v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Material Design 3
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
