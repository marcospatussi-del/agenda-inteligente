import React, { useState, useEffect } from 'react';
import {
  Box, Typography, ToggleButtonGroup, ToggleButton, Card, CardContent,
  Grid, Button, Chip, Paper, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import { Icon } from '../components/Icons';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';

export default function CalendarView({ onOpenNewEvent, categories = [] }) {
  const [viewMode, setViewMode] = useState('month'); // day, week, month, list
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const formattedDateStr = selectedDate.toISOString().split('T')[0];

  const fetchCalendarAppointments = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const yr = selectedDate.getFullYear();
      const mo = selectedDate.getMonth();

      if (viewMode === 'day') {
        startDate = formattedDateStr;
        endDate = formattedDateStr;
      } else if (viewMode === 'week') {
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        startDate = start.toISOString().split('T')[0];
        endDate = end.toISOString().split('T')[0];
      } else if (viewMode === 'month') {
        startDate = new Date(yr, mo, 1).toISOString().split('T')[0];
        endDate = new Date(yr, mo + 1, 0).toISOString().split('T')[0];
      } else {
        startDate = `${yr}-01-01`;
        endDate = `${yr}-12-31`;
      }

      const res = await API.get(`/appointments?startDate=${startDate}&endDate=${endDate}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Erro ao carregar calendário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarAppointments();
  }, [selectedDate, viewMode]);

  const handlePrev = () => {
    const nextDate = new Date(selectedDate);
    if (viewMode === 'day') nextDate.setDate(nextDate.getDate() - 1);
    else if (viewMode === 'week') nextDate.setDate(nextDate.getDate() - 7);
    else if (viewMode === 'month') nextDate.setMonth(nextDate.getMonth() - 1);
    else nextDate.setFullYear(nextDate.getFullYear() - 1);
    setSelectedDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(selectedDate);
    if (viewMode === 'day') nextDate.setDate(nextDate.getDate() + 1);
    else if (viewMode === 'week') nextDate.setDate(nextDate.getDate() + 7);
    else if (viewMode === 'month') nextDate.setMonth(nextDate.getMonth() + 1);
    else nextDate.setFullYear(nextDate.getFullYear() + 1);
    setSelectedDate(nextDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      fetchCalendarAppointments();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir compromisso?')) {
      try {
        await API.delete(`/appointments/${id}`);
        fetchCalendarAppointments();
      } catch (err) {
        alert('Erro ao excluir compromisso.');
      }
    }
  };

  const handleShiftTime = async (appt, newTime) => {
    try {
      await API.put(`/appointments/${appt.id}`, { time: newTime });
      fetchCalendarAppointments();
    } catch (err) {
      alert('Erro ao alterar horário.');
    }
  };

  // Helper for Month Visual Grid calculation
  const yr = selectedDate.getFullYear();
  const mo = selectedDate.getMonth();
  const firstDayIndex = new Date(yr, mo, 1).getDay();
  const totalDaysInMonth = new Date(yr, mo + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const weekDaysHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Calendário 📆
          </Typography>
          <Button variant="outlined" size="small" onClick={handleToday} startIcon={<Icon name="today" />} sx={{ borderRadius: '16px', ml: 1 }}>
            Hoje
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Navigation Arrows */}
          <Paper sx={{ display: 'flex', alignItems: 'center', borderRadius: '20px', p: 0.5 }}>
            <IconButton onClick={handlePrev} size="small"><Icon name="chevron_left" /></IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, px: 2, minWidth: 160, textAlign: 'center' }}>
              {viewMode === 'month' && selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              {viewMode === 'day' && selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
              {viewMode === 'week' && `Semana de ${selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`}
              {viewMode === 'list' && 'Lista Geral'}
            </Typography>
            <IconButton onClick={handleNext} size="small"><Icon name="chevron_right" /></IconButton>
          </Paper>

          {/* View Mode Switcher */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
            sx={{ '& .MuiToggleButton-root': { borderRadius: '16px', fontWeight: 700 } }}
          >
            <ToggleButton value="month"><Icon name="calendar_view_month" sx={{ mr: 0.5 }} /> Mês</ToggleButton>
            <ToggleButton value="week"><Icon name="view_week" sx={{ mr: 0.5 }} /> Semana</ToggleButton>
            <ToggleButton value="day"><Icon name="view_day" sx={{ mr: 0.5 }} /> Dia</ToggleButton>
            <ToggleButton value="list"><Icon name="list" sx={{ mr: 0.5 }} /> Lista</ToggleButton>
          </ToggleButtonGroup>

          <Button variant="contained" startIcon={<Icon name="add" />} onClick={() => onOpenNewEvent()} sx={{ borderRadius: '24px', px: 3, fontWeight: 700 }}>
            Novo Evento
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'month' ? (
        /* Visual Month Grid View */
        <Paper sx={{ p: 2, borderRadius: '24px', bgcolor: 'background.paper' }}>
          {/* Days of week header */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1, textAlign: 'center' }}>
            {weekDaysHeader.map((d) => (
              <Typography key={d} variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', py: 1 }}>
                {d}
              </Typography>
            ))}
          </Box>

          {/* Month grid cells */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {/* Empty padding cells before 1st day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <Box key={`pad-${i}`} sx={{ minHeight: 110, bgcolor: 'action.hover', opacity: 0.3, borderRadius: '12px' }} />
            ))}

            {/* Days 1..daysInMonth */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const dayAppts = appointments.filter((a) => a.date === dateStr);

              return (
                <Paper
                  key={dayNum}
                  variant="outlined"
                  sx={{
                    minHeight: 110,
                    p: 1,
                    borderRadius: '16px',
                    borderColor: isToday ? 'primary.main' : 'divider',
                    borderWidth: isToday ? '2px' : '1px',
                    bgcolor: isToday ? 'primary.light' : 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        px: 1,
                        py: 0.2,
                        borderRadius: '50%',
                        bgcolor: isToday ? 'primary.main' : 'transparent',
                        color: isToday ? '#fff' : 'text.primary'
                      }}
                    >
                      {dayNum}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onOpenNewEvent({ date: dateStr })}
                      sx={{ p: 0.2 }}
                    >
                      <Icon name="add" fontSize={14} />
                    </IconButton>
                  </Box>

                  {/* Day Appointment Pills */}
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto', maxHeight: 80 }}>
                    {dayAppts.map((appt) => (
                      <Tooltip key={appt.id} title={`${appt.time} - ${appt.title}`}>
                        <Chip
                          label={`${appt.time} ${appt.title}`}
                          size="small"
                          onClick={() => onOpenNewEvent(appt)}
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: appt.category?.color || '#6750A4',
                            color: '#fff',
                            '& .MuiChip-label': { px: 0.8, py: 0 }
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      ) : (
        /* List / Cards View */
        <Box>
          {appointments.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Nenhum compromisso encontrado neste período.
              </Typography>
              <Button variant="outlined" onClick={() => onOpenNewEvent()} sx={{ mt: 2 }}>
                Agendar Novo Compromisso
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {appointments.map((appt) => (
                <Grid item xs={12} sm={6} md={4} key={appt.id}>
                  <AppointmentCard
                    appointment={appt}
                    onEdit={() => onOpenNewEvent(appt)}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: -1, mb: 2, px: 1 }}>
                    <Chip
                      label="+ 1 Hora"
                      size="small"
                      clickable
                      onClick={() => {
                        const [h, m] = appt.time.split(':');
                        const newH = String((parseInt(h) + 1) % 24).padStart(2, '0');
                        handleShiftTime(appt, `${newH}:${m}`);
                      }}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label="- 1 Hora"
                      size="small"
                      clickable
                      onClick={() => {
                        const [h, m] = appt.time.split(':');
                        const newH = String((parseInt(h) - 1 + 24) % 24).padStart(2, '0');
                        handleShiftTime(appt, `${newH}:${m}`);
                      }}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}
