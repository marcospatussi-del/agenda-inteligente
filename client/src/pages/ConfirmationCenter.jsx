import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Paper
} from '@mui/material';
import { Icon } from '../components/Icons';
import API from '../services/api';

export default function ConfirmationCenter() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchTodayConfirmations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/confirmations/today');
      setItems(res.data);
    } catch (err) {
      console.error('Erro ao buscar confirmações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayConfirmations();
  }, []);

  const handleAction = async (appointmentId, action, rescheduleData = {}) => {
    try {
      const res = await API.post(`/confirmations/${appointmentId}/action`, {
        action,
        ...rescheduleData
      });

      setActionSuccessMsg(res.data.message);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      fetchTodayConfirmations();
    } catch (err) {
      alert('Erro ao processar confirmação.');
    }
  };

  const handleOpenReschedule = (appt) => {
    setSelectedAppt(appt);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setNewDate(tomorrowStr);
    setNewTime(appt.time || '10:00');
    setRescheduleDialogOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedAppt || !newDate || !newTime) return;
    handleAction(selectedAppt.id, 'RESCHEDULE', { rescheduleDate: newDate, rescheduleTime: newTime });
    setRescheduleDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Confirmação dos Eventos ✅
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Central de triage e validação diária de presença e conclusão de compromissos.
        </Typography>
      </Box>

      {actionSuccessMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '16px' }} onClose={() => setActionSuccessMsg('')}>
          {actionSuccessMsg}
        </Alert>
      )}

      {items.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
          <Typography variant="h6" color="text.secondary">
            🎉 Todos os compromissos de hoje já foram confirmados ou arquivados no Histórico!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {items.map(({ appointment, confirmation }) => {
            const isConfirmed = confirmation?.status === 'CONFIRMED';
            const isCompleted = confirmation?.status === 'COMPLETED';

            return (
              <Grid item xs={12} md={6} key={appointment.id}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    borderLeft: `6px solid ${appointment.category?.color || '#6750A4'}`,
                    bgcolor: isCompleted ? 'background.surfaceContainer' : 'background.paper'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={appointment.category?.name || 'Geral'}
                        size="small"
                        sx={{ bgcolor: `${appointment.category?.color}20`, color: appointment.category?.color, fontWeight: 700 }}
                      />
                      <Chip
                        label={confirmation?.status || 'PENDENTE'}
                        size="small"
                        color={isCompleted ? 'success' : isConfirmed ? 'primary' : 'warning'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {appointment.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <Icon name="schedule" fontSize={16} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                      Horário: <strong>{appointment.time}</strong> • Prioridade: {appointment.priority}
                    </Typography>

                    {/* Action Buttons */}
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <Button
                          fullWidth
                          variant={isConfirmed ? 'contained' : 'outlined'}
                          color="primary"
                          size="small"
                          onClick={() => handleAction(appointment.id, 'CONFIRM')}
                          startIcon={<Icon name="check" />}
                          sx={{ borderRadius: '14px', fontSize: '0.75rem', py: 0.8 }}
                        >
                          Confirmar
                        </Button>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAction(appointment.id, 'COMPLETE')}
                          startIcon={<Icon name="check_circle" />}
                          sx={{ borderRadius: '14px', fontSize: '0.75rem', py: 0.8 }}
                        >
                          Concluir
                        </Button>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleOpenReschedule(appointment)}
                          startIcon={<Icon name="schedule" />}
                          sx={{ borderRadius: '14px', fontSize: '0.75rem', py: 0.8 }}
                        >
                          Reagendar
                        </Button>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleAction(appointment.id, 'CANCEL')}
                          startIcon={<Icon name="cancel" />}
                          sx={{ borderRadius: '14px', fontSize: '0.75rem', py: 0.8 }}
                        >
                          Cancelar
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Reschedule Modal Dialog */}
      <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Reagendar Compromisso</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Escolha a nova data e horário para <strong>{selectedAppt?.title}</strong>:
          </Typography>
          <TextField
            fullWidth
            type="date"
            label="Nova Data"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="time"
            label="Novo Horário"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRescheduleDialogOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleConfirmReschedule} variant="contained" color="primary">Confirmar Reagendamento</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
