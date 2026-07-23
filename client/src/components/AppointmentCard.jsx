import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem
} from '@mui/material';
import { Icon } from './Icons';

const priorityColors = {
  VERY_HIGH: { label: 'Muito Alta', color: '#E53935', bg: '#FFEBEE' },
  HIGH: { label: 'Alta', color: '#FB8C00', bg: '#FFF3E0' },
  NORMAL: { label: 'Normal', color: '#1E88E5', bg: '#E3F2FD' },
  LOW: { label: 'Baixa', color: '#757575', bg: '#F5F5F5' },
};

const statusLabels = {
  SCHEDULED: { label: 'Agendado', color: 'info' },
  IN_PROGRESS: { label: 'Em Andamento', color: 'warning' },
  COMPLETED: { label: 'Concluído', color: 'success' },
  CANCELLED: { label: 'Cancelado', color: 'error' },
};

export default function AppointmentCard({ appointment, onEdit, onDelete, onStatusChange }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const priorityInfo = priorityColors[appointment.priority] || priorityColors.NORMAL;
  const statusInfo = statusLabels[appointment.status] || statusLabels.SCHEDULED;

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        position: 'relative',
        borderLeft: `6px solid ${appointment.color || appointment.category?.color || '#6750A4'}`,
        mb: 2,
        opacity: appointment.status === 'COMPLETED' ? 0.85 : 1,
        textDecoration: appointment.status === 'CANCELLED' ? 'line-through' : 'none'
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Top Header Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              icon={<Icon name={appointment.category?.icon || 'bookmark'} fontSize={14} />}
              label={appointment.category?.name || 'Geral'}
              size="small"
              sx={{
                bgcolor: `${appointment.category?.color || '#6750A4'}15`,
                color: appointment.category?.color || '#6750A4',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              icon={<Icon name="flag" color={priorityInfo.color} fontSize={14} />}
              label={priorityInfo.label}
              size="small"
              sx={{
                bgcolor: priorityInfo.bg,
                color: priorityInfo.color,
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={statusInfo.label}
              size="small"
              color={statusInfo.color}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
            {appointment.tag && (
              <Chip label={`#${appointment.tag}`} size="small" variant="filled" sx={{ fontSize: '0.7rem' }} />
            )}
            {appointment.user?.name && (
              <Chip
                icon={<Icon name="people" fontSize={14} />}
                label={`Agenda de: ${appointment.user.name}`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
            {appointment.isShared === false && (
              <Chip
                icon={<Icon name="lock" fontSize={14} />}
                label="Privado"
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(229,57,53,0.10)',
                  color: '#E53935',
                  borderColor: '#E53935'
                }}
                variant="outlined"
              />
            )}
          </Box>

          <IconButton size="small" onClick={handleMenuClick}>
            <Icon name="more_vert" />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {appointment.title}
        </Typography>

        {/* Description */}
        {appointment.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {appointment.description}
          </Typography>
        )}

        {/* Time and Location */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', color: 'text.secondary', fontSize: '0.85rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Icon name="schedule" color="#6750A4" fontSize={18} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {appointment.date} às {appointment.time}
            </Typography>
          </Box>

          {appointment.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon name="location_on" color="#E53935" fontSize={18} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {appointment.location}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { borderRadius: '12px', minWidth: 160 } }}
        >
          {appointment.status !== 'COMPLETED' && (
            <MenuItem onClick={() => { handleMenuClose(); onStatusChange(appointment.id, 'COMPLETED'); }}>
              <Icon name="check_circle" color="#2E7D32" sx={{ mr: 1 }} /> Concluir
            </MenuItem>
          )}
          <MenuItem onClick={() => { handleMenuClose(); onEdit(appointment); }}>
            <Icon name="edit" color="#6750A4" sx={{ mr: 1 }} /> Editar
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
            const token = localStorage.getItem('token');
            window.open(`/api/appointments/${appointment.id}/export-ics?token=${token}`, '_blank');
          }}>
            <Icon name="download" color="#1E88E5" sx={{ mr: 1 }} /> Exportar (.ics)
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); onDelete(appointment.id); }} sx={{ color: 'error.main' }}>
            <Icon name="delete" sx={{ mr: 1 }} /> Excluir
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}
