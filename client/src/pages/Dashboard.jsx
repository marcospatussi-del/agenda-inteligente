import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Alert,
  CircularProgress, Paper
} from '@mui/material';
import { Icon } from '../components/Icons';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import ProductivityCharts from '../components/ProductivityCharts';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

export default function Dashboard({ onOpenNewEvent, categories = [] }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [triggerMsg, setTriggerMsg] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await API.get('/appointments/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      fetchSummary();
    } catch (err) {
      alert('Erro ao atualizar compromisso.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este compromisso?')) {
      try {
        await API.delete(`/appointments/${id}`);
        fetchSummary();
      } catch (err) {
        alert('Erro ao excluir compromisso.');
      }
    }
  };

  const handleTriggerEmail = async (period) => {
    try {
      const res = await API.post('/confirmations/trigger-email', { period });
      setTriggerMsg(`E-mails do horário das ${period} foram enviados com sucesso!`);
      setTimeout(() => setTriggerMsg(''), 5000);
    } catch (err) {
      alert('Erro ao disparar e-mails de teste.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const {
    today = [],
    upcoming = [],
    overdue = [],
    completedCount = 0,
    occupiedHours = 0,
    freeHours = 8,
    productivityScore = 100,
    categoryDistribution = []
  } = summary || {};

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Agenda de Hoje 🗓️
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => handleTriggerEmail('07:00')}
            startIcon={<Icon name="email" />}
            sx={{ borderRadius: '20px' }}
          >
            Testar Email 07:00
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon name="add" />}
            onClick={() => onOpenNewEvent()}
            sx={{ borderRadius: '24px', px: 3, fontWeight: 700 }}
          >
            Novo Compromisso
          </Button>
        </Box>
      </Box>

      {triggerMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '16px' }} onClose={() => setTriggerMsg('')}>
          {triggerMsg}
        </Alert>
      )}

      {/* Overdue Warning Alert */}
      {overdue.length > 0 && (
        <Alert
          severity="warning"
          icon={<Icon name="warning" color="#ED6C02" />}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/history?filter=overdue')}>
              Ver Atrasados
            </Button>
          }
          sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}
        >
          Atenção: Você possui <strong>{overdue.length} compromisso(s) atrasado(s)</strong> precisando de atenção!
        </Alert>
      )}

      {/* KPI Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600 }}>Agenda do Dia</Typography>
                <Icon name="event_available" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>{today.length}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Compromissos hoje</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Próximos</Typography>
                <Icon name="pending_actions" color="#0288D1" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>{upcoming.length}</Typography>
              <Typography variant="caption" color="text.secondary">Nos próximos dias</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Concluídos</Typography>
                <Icon name="check_circle" color="#2E7D32" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1, color: 'success.main' }}>{completedCount}</Typography>
              <Typography variant="caption" color="text.secondary">Total finalizados</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Produtividade</Typography>
                <Icon name="trending_up" color="#6750A4" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1, color: 'primary.main' }}>{productivityScore}%</Typography>
              <Typography variant="caption" color="text.secondary">Taxa de conclusão</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid: Left Today's Events & Right Upcoming/Confirmation shortcut */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left Column: Today's Appointments */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              📌 Compromissos de Hoje ({today.length})
            </Typography>
            <Button size="small" onClick={() => navigate('/confirmations')} endIcon={<Icon name="arrow_forward" />}>
              Caixa de Confirmação
            </Button>
          </Box>

          {today.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                🎉 Você não tem compromissos agendados para hoje.
              </Typography>
              <Button variant="outlined" onClick={() => onOpenNewEvent()}>
                Adicionar Compromisso
              </Button>
            </Paper>
          ) : (
            today.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onEdit={() => onOpenNewEvent(appt)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </Grid>

        {/* Right Column: Upcoming & Overdue */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📅 Próximos Compromissos
          </Typography>
          {upcoming.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '20px' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum compromisso agendado para os próximos dias.
              </Typography>
            </Paper>
          ) : (
            upcoming.map((appt) => (
              <Paper key={appt.id} sx={{ p: 2, mb: 1.5, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{appt.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(appt.date)} às {appt.time} • {appt.category?.name}
                  </Typography>
                </Box>
              </Paper>
            ))
          )}
        </Grid>
      </Grid>

      {/* Analytics & Charts */}
      <ProductivityCharts
        categoryData={categoryDistribution}
        occupiedHours={occupiedHours}
        freeHours={freeHours}
        productivityScore={productivityScore}
      />
    </Box>
  );
}
