import React, { useState } from 'react';
import {
  Container, Box, Card, CardContent, Typography, TextField, Button,
  Tabs, Tab, Divider, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Icon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 0) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin({
        email: 'usuario.google@agenda.com',
        name: 'Usuário Google',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        googleId: 'google_mock_12345'
      });
      navigate('/');
    } catch (err) {
      setError('Erro no login do Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '28px', p: 2, boxShadow: '0px 8px 30px rgba(103, 80, 164, 0.12)' }}>
          <CardContent>
            {/* Header Logo */}
            <Box sx={{ textCenter: 'center', textAlign: 'center', mb: 3 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '18px', bgcolor: 'primary.main', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem', mb: 1 }}>
                AI
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Agenda Inteligente
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Gestão simples, elegante e inteligente para seu dia
              </Typography>
            </Box>

            <Tabs value={tab} onChange={(e, val) => { setTab(val); setError(''); }} centered sx={{ mb: 3 }}>
              <Tab label="Entrar (Login)" sx={{ fontWeight: 700 }} />
              <Tab label="Criar Conta" sx={{ fontWeight: 700 }} />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {tab === 1 && (
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Icon name="person" /></InputAdornment>
                  }}
                />
              )}

              <TextField
                fullWidth
                type="email"
                label="Endereço de E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Icon name="email" /></InputAdornment>
                }}
              />

              {tab === 1 && (
                <TextField
                  fullWidth
                  label="Telefone (opcional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Icon name="phone" /></InputAdornment>
                  }}
                />
              )}

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Icon name="lock" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, borderRadius: '24px', fontWeight: 700, fontSize: '1rem', mb: 2 }}
              >
                {tab === 0 ? 'Entrar' : 'Cadastrar Conta'}
              </Button>
            </form>

            <Divider sx={{ my: 2 }}>OU</Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleMockGoogleLogin}
              startIcon={<Icon name="g_mobiledata" color="#EA4335" fontSize={28} />}
              sx={{ py: 1.2, borderRadius: '24px', fontWeight: 600, color: 'text.primary', borderColor: 'divider' }}
            >
              Continuar com o Google
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
