import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Avatar, Tabs, Tab
} from '@mui/material';
import { Icon } from '../components/Icons';
import API from '../services/api';

export default function AdminPanel({ categories = [], onCategoryUpdate }) {
  const [activeTab, setActiveTab] = useState(0); // 0 = Users, 1 = Categories, 2 = System Stats & Logs
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#6750A4');
  const [catIcon, setCatIcon] = useState('bookmark');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Erro ao carregar painel admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await API.put(`/admin/users/${userId}/role`, { role: nextRole });
      fetchAdminData();
    } catch (err) {
      alert('Erro ao alterar permissão do usuário.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Excluir este usuário permanentemente?')) {
      try {
        await API.delete(`/admin/users/${userId}`);
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.error || 'Erro ao excluir usuário.');
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/categories', { name: catName, color: catColor, icon: catIcon });
      setNewCatOpen(false);
      setCatName('');
      if (onCategoryUpdate) onCategoryUpdate();
      fetchAdminData();
    } catch (err) {
      alert('Erro ao criar categoria.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Excluir categoria?')) {
      try {
        await API.delete(`/categories/${catId}`);
        if (onCategoryUpdate) onCategoryUpdate();
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.error || 'Erro ao excluir categoria.');
      }
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Painel Administrativo 🛡️
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestão de usuários, regras de categorias e monitoramento de estatísticas.
          </Typography>
        </Box>
        <IconButton onClick={fetchAdminData}><Icon name="refresh" /></IconButton>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Usuários</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1, color: 'primary.main' }}>
                {stats?.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Compromissos</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
                {stats?.totalAppointments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Concluídos</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1, color: 'success.main' }}>
                {stats?.completedAppointments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Categorias Registradas</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 1, color: 'tertiary.main' }}>
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Usuários do Sistema" sx={{ fontWeight: 700 }} />
        <Tab label="Gerenciar Categorias" sx={{ fontWeight: 700 }} />
        <Tab label="Logs & Estatísticas" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Tab 0: Users Table */}
      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Usuário</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telefone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Papel (Role)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Compromissos</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={u.photo}>{u.name?.charAt(0)}</Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{u.name}</Typography>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      color={u.role === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>{u._count?.appointments || 0}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleToggleRole(u.id, u.role)} sx={{ mr: 1 }}>
                      Tornar {u.role === 'ADMIN' ? 'User' : 'Admin'}
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}>
                      <Icon name="delete" fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 1: Categories Manager */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Categorias Disponíveis</Typography>
            <Button variant="contained" startIcon={<Icon name="add" />} onClick={() => setNewCatOpen(true)} sx={{ borderRadius: '20px' }}>
              Nova Categoria
            </Button>
          </Box>

          <Grid container spacing={2}>
            {categories.map((cat) => (
              <Grid item xs={12} sm={6} md={4} key={cat.id}>
                <Paper sx={{ p: 2, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon name="circle" color={cat.color} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{cat.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cat.isSystem ? 'Sistema (Nativa)' : 'Customizada pelo usuário'}
                      </Typography>
                    </Box>
                  </Box>
                  {!cat.isSystem && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteCategory(cat.id)}>
                      <Icon name="delete" fontSize="small" />
                    </IconButton>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab 2: System Logs */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Últimos Logs do Sistema</Typography>
          <Paper sx={{ p: 2, borderRadius: '20px' }}>
            {stats?.recentLogs?.map((log) => (
              <Box key={log.id} sx={{ py: 1, borderBottom: '1px solid #E0E0E0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label={log.level} size="small" color={log.level === 'ERROR' ? 'error' : 'info'} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{log.message}</Typography>
                {log.user && <Typography variant="caption" color="text.secondary">Por: {log.user.email}</Typography>}
              </Box>
            ))}
          </Paper>
        </Box>
      )}

      {/* Dialog for New Category */}
      <Dialog open={newCatOpen} onClose={() => setNewCatOpen(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Nova Categoria</DialogTitle>
        <form onSubmit={handleCreateCategory}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nome da Categoria"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="color"
              label="Cor do Tema"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setNewCatOpen(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Criar Categoria</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
