import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Box, Typography, Grid, IconButton, FormControl, InputLabel, Select,
  Switch, FormControlLabel, Divider
} from '@mui/material';
import { Icon } from './Icons';

const colorPresets = ['#6750A4', '#1E88E5', '#8E24AA', '#E53935', '#43A047', '#FB8C00', '#00ACC1', '#F4511E', '#757575'];

export default function AppointmentModal({ open, onClose, onSave, initialData, categories = [] }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    date: todayStr,
    time: '09:00',
    location: '',
    notes: '',
    priority: 'NORMAL',
    status: 'SCHEDULED',
    color: '#6750A4',
    tag: '',
    isShared: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId || (categories[0]?.id || ''),
        date: initialData.date || todayStr,
        time: initialData.time || '09:00',
        location: initialData.location || '',
        notes: initialData.notes || '',
        priority: initialData.priority || 'NORMAL',
        status: initialData.status || 'SCHEDULED',
        color: initialData.color || '#6750A4',
        tag: initialData.tag || '',
        isShared: initialData.isShared !== undefined ? initialData.isShared : true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '',
        date: todayStr,
        time: '09:00',
        location: '',
        notes: '',
        priority: 'NORMAL',
        status: 'SCHEDULED',
        color: '#6750A4',
        tag: '',
        isShared: true
      });
    }
  }, [initialData, categories, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.date || !formData.time) {
      alert('Por favor, preencha o Título, Categoria, Data e Hora.');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {initialData ? 'Editar Compromisso' : 'Novo Compromisso'}
        </Typography>
        <IconButton onClick={onClose}>
          <Icon name="close" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderBottom: 'none' }}>
          <Grid container spacing={2}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título do Compromisso *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="Ex: Reunião de Equipe, Exame Médico..."
              />
            </Grid>

            {/* Category & Priority */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Categoria"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon name="circle" color={cat.color} fontSize={14} />
                        {cat.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Prioridade"
                >
                  <MenuItem value="VERY_HIGH">🚨 Muito Alta</MenuItem>
                  <MenuItem value="HIGH">🔥 Alta</MenuItem>
                  <MenuItem value="NORMAL">🔹 Normal</MenuItem>
                  <MenuItem value="LOW">🌱 Baixa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date & Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Data *"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Hora *"
                name="time"
                value={formData.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Status & Tag */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="SCHEDULED">Agendado</MenuItem>
                  <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
                  <MenuItem value="COMPLETED">Concluído</MenuItem>
                  <MenuItem value="CANCELLED">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Etiqueta / Tag (opcional)"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                placeholder="Ex: Trabalho, Urgente, ProjetoX"
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Local (opcional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Sala 4, Google Meet, Hospital Einstein..."
              />
            </Grid>

            {/* Description & Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalhes sobre o compromisso..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações Adicionais"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Anotações para lembretes..."
              />
            </Grid>

            {/* Color Palette Selector */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                Cor Personalizada do Cartão:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colorPresets.map((c) => (
                  <IconButton
                    key={c}
                    onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: c,
                      border: formData.color === c ? '3px solid #1D192B' : 'none',
                      '&:hover': { opacity: 0.8 }
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Privacy Toggle */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: '16px',
                bgcolor: formData.isShared ? 'rgba(103,80,164,0.07)' : 'rgba(229,57,53,0.07)',
                border: '1px solid',
                borderColor: formData.isShared ? 'primary.light' : 'error.light',
                transition: 'all 0.25s ease'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.3 }}>
                    {formData.isShared ? '👥 Visível na Agenda Compartilhada' : '🔒 Privado (só você vê)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.isShared
                      ? 'Pessoas com acesso à sua agenda também verão este compromisso.'
                      : 'Este compromisso não aparecerá para quem tiver acesso à sua agenda.'}
                  </Typography>
                </Box>
                <Switch
                  checked={formData.isShared}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isShared: e.target.checked }))}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} color="inherit" sx={{ borderRadius: '20px' }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: '20px', px: 3 }}>
            {initialData ? 'Salvar Alterações' : 'Cadastrar Compromisso'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
