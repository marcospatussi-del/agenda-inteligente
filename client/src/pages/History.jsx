import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, MenuItem, FormControl,
  InputLabel, Select, InputAdornment, IconButton, CircularProgress, Button
} from '@mui/material';
import { Icon } from '../components/Icons';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';

export default function History({ categories = [] }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (status) queryParams.append('status', status);
      if (priority) queryParams.append('priority', priority);
      if (startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);
      }

      const res = await API.get(`/appointments?${queryParams.toString()}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [categoryId, status, priority, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setStatus('');
    setPriority('');
    setStartDate('');
    setEndDate('');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/appointments/${id}`, { status: newStatus });
      fetchHistory();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir compromisso?')) {
      try {
        await API.delete(`/appointments/${id}`);
        fetchHistory();
      } catch (err) {
        alert('Erro ao excluir compromisso.');
      }
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Histórico & Pesquisa 🔍
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulte compromissos passados, pesquise por palavras-chave e aplique filtros dinâmicos.
        </Typography>
      </Box>

      {/* Filter Toolbar Paper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '24px' }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            {/* Keyword Search Input */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Pesquisar por título, local ou tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Icon name="search" /></InputAdornment>,
                  endAdornment: search ? (
                    <IconButton size="small" onClick={() => setSearch('')}><Icon name="clear" /></IconButton>
                  ) : null
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  label="Categoria"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="SCHEDULED">Agendado</MenuItem>
                  <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                  <MenuItem value="COMPLETED">Concluído</MenuItem>
                  <MenuItem value="CANCELLED">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Prioridade"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="VERY_HIGH">Muito Alta</MenuItem>
                  <MenuItem value="HIGH">Alta</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="LOW">Baixa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Submit & Clear */}
            <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth type="submit" variant="contained" color="primary" sx={{ borderRadius: '16px' }}>
                Buscar
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={handleClearFilters} sx={{ borderRadius: '16px' }}>
                Limpar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Results Count & Export CSV */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {appointments.length} compromisso(s) encontrado(s)
        </Typography>
        {appointments.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon name="download" />}
            onClick={() => {
              const headers = ['Título', 'Data', 'Horário', 'Categoria', 'Status', 'Prioridade', 'Local', 'Notas'];
              const rows = appointments.map(a => [
                `"${a.title.replace(/"/g, '""')}"`,
                `"${a.date}"`,
                `"${a.time}"`,
                `"${a.category?.name || ''}"`,
                `"${a.status}"`,
                `"${a.priority}"`,
                `"${(a.location || '').replace(/"/g, '""')}"`,
                `"${(a.notes || '').replace(/"/g, '""')}"`
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `agenda_export_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            sx={{ borderRadius: '16px' }}
          >
            Exportar CSV
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum compromisso encontrado com os filtros selecionados.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {appointments.map((appt) => (
            <Grid item xs={12} md={6} key={appt.id}>
              <AppointmentCard
                appointment={appt}
                onEdit={() => {}}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
