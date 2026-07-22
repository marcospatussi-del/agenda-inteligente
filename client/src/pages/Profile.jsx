import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Avatar, Alert,
  Switch, FormControlLabel
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';

export default function Profile() {
  const { user, updateProfile, updateSettings } = useAuth();
  const { mode, toggleTheme } = useThemeContext();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [password, setPassword] = useState('');

  // Settings state
  const [morningEmail, setMorningEmail] = useState(user?.settings?.morningEmail || '07:00');
  const [afternoonEmail, setAfternoonEmail] = useState(user?.settings?.afternoonEmail || '12:00');
  const [emailEnabled, setEmailEnabled] = useState(user?.settings?.emailEnabled !== false);
  const [pushEnabled, setPushEnabled] = useState(user?.settings?.pushEnabled !== false);

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const updatePayload = { name, phone, photo };
      if (password) updatePayload.password = password;
      await updateProfile(updatePayload);
      setMsg('Perfil atualizado com sucesso!');
      setPassword('');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError('Erro ao atualizar perfil.');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await updateSettings({
        morningEmail,
        afternoonEmail,
        emailEnabled,
        pushEnabled,
        themePreference: mode
      });
      setMsg('Configurações de notificação salvas!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError('Erro ao salvar configurações.');
    }
  };

  return (
    <Box sx={{ pb: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Perfil & Ajustes ⚙️
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie dados pessoais, preferências de temas e horários de notificação por e-mail.
      </Typography>

      {msg && <Alert severity="success" sx={{ mb: 3, borderRadius: '16px' }}>{msg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* User Avatar Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textCenter: 'center', textAlign: 'center', borderRadius: '24px' }}>
            <Avatar src={photo} alt={name} sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: '4px solid #6750A4' }}>
              {name?.charAt(0)}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
            <Button variant="outlined" size="small" onClick={toggleTheme} startIcon={<Icon name="palette" />}>
              Tema Atual: {mode === 'light' ? 'Claro' : 'Escuro'}
            </Button>
          </Paper>
        </Grid>

        {/* Profile Info Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '24px', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Dados do Usuário
            </Typography>
            <form onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="URL da Foto (opcional)" value={photo} onChange={(e) => setPhoto(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nova Senha (deixe em branco para não alterar)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" startIcon={<Icon name="save" />} sx={{ borderRadius: '20px', px: 3 }}>
                    Salvar Dados
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Email Notification Schedule Form */}
          <Paper sx={{ p: 3, borderRadius: '24px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Lembretes Inteligentes por E-mail ✉️
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              O sistema verifica e envia automaticamente os compromissos diários nos horários programados abaixo.
            </Typography>

            <form onSubmit={handleSettingsSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Primeiro Lembrete (Manhã)"
                    value={morningEmail}
                    onChange={(e) => setMorningEmail(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Segundo Lembrete (Tarde)"
                    value={afternoonEmail}
                    onChange={(e) => setAfternoonEmail(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Switch checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} color="primary" />}
                    label="Ativar Envio Automático de E-mails"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Switch checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} color="primary" />}
                    label="Ativar Notificações no Navegador"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" startIcon={<Icon name="save" />} sx={{ borderRadius: '20px', px: 3 }}>
                    Salvar Preferências de Notificação
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
