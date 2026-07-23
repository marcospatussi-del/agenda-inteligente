import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar,
  IconButton, Alert, CircularProgress, Divider, Chip, Paper
} from '@mui/material';
import { Icon } from './Icons';
import API from '../services/api';

export default function ShareModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [createdShares, setCreatedShares] = useState([]);
  const [receivedShares, setReceivedShares] = useState([]);
  const [msg, setMsg] = useState({ text: '', severity: 'info' });

  const fetchShares = async () => {
    setFetching(true);
    try {
      const res = await API.get('/shares');
      setCreatedShares(res.data.createdShares || []);
      setReceivedShares(res.data.receivedShares || []);
    } catch (err) {
      console.error('Erro ao buscar compartilhamentos:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchShares();
      setEmail('');
      setMsg({ text: '', severity: 'info' });
    }
  }, [open]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMsg({ text: '', severity: 'info' });

    try {
      const res = await API.post('/shares', { email });
      setMsg({ text: res.data.message, severity: 'success' });
      setEmail('');
      fetchShares();
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Erro ao compartilhar agenda.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm('Deseja realmente revogar o compartilhamento desta agenda?')) {
      try {
        await API.delete(`/shares/${id}`);
        setMsg({ text: 'Compartilhamento revogado com sucesso.', severity: 'success' });
        fetchShares();
      } catch (err) {
        setMsg({ text: 'Erro ao revogar compartilhamento.', severity: 'error' });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon name="share" color="#6750A4" fontSize={28} />
        Compartilhar Agenda
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Convide pessoas pelo e-mail para visualizar e editar compromissos na agenda compartilhada.
        </Typography>

        {msg.text && (
          <Alert severity={msg.severity} sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setMsg({ text: '', severity: 'info' })}>
            {msg.text}
          </Alert>
        )}

        {/* Share Form */}
        <Box component="form" onSubmit={handleShare} sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="email"
            placeholder="Digite o e-mail do usuário (ex: usuario@email.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: <Icon name="email" fontSize={18} sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Icon name="person_add" />}
            sx={{ borderRadius: '16px', px: 3, fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Compartilhar
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Section 1: Shares Created */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
          📤 Agendas que eu compartilhei ({createdShares.length})
        </Typography>

        {fetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : createdShares.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Você ainda não compartilhou sua agenda com ninguém.
          </Typography>
        ) : (
          <List dense sx={{ mb: 2 }}>
            {createdShares.map((s) => (
              <Paper key={s.id} variant="outlined" sx={{ mb: 1, borderRadius: '16px', p: 0.5 }}>
                <ListItem
                  secondaryAction={
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRevoke(s.id)}
                      startIcon={<Icon name="delete" fontSize={16} />}
                      sx={{ borderRadius: '12px', fontSize: '0.75rem' }}
                    >
                      Revogar
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={s.sharedWithUser?.photo} sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {(s.sharedWithUser?.name || s.sharedWithEmail).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={s.sharedWithUser?.name || s.sharedWithEmail}
                    secondary={s.sharedWithEmail}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Section 2: Shares Received */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'secondary.main' }}>
          📥 Agendas compartilhadas comigo ({receivedShares.length})
        </Typography>

        {receivedShares.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Nenhum usuário compartilhou a agenda com você ainda.
          </Typography>
        ) : (
          <List dense>
            {receivedShares.map((s) => (
              <Paper key={s.id} variant="outlined" sx={{ mb: 1, borderRadius: '16px', p: 0.5, bgcolor: 'action.hover' }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={s.owner?.photo} sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {(s.owner?.name || s.owner?.email || 'A').charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={s.owner?.name || 'Proprietário'}
                    secondary={`${s.owner?.email} • Permissão: Edição total`}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
                  />
                  <Chip label="Ativo" color="success" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '16px', px: 3 }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
