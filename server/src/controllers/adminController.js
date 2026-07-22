const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAdminStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const totalAppointments = await prisma.appointment.count();
    const completedAppointments = await prisma.appointment.count({ where: { status: 'COMPLETED' } });
    const pendingAppointments = await prisma.appointment.count({ where: { status: 'SCHEDULED' } });
    const totalCategories = await prisma.category.count();
    const totalLogs = await prisma.systemLog.count();

    const recentLogs = await prisma.systemLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    return res.json({
      totalUsers,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalCategories,
      totalLogs,
      recentLogs
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar estatísticas do painel administrativo.' });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        photo: true,
        createdAt: true,
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Papel inválido.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar permissão do usuário.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta pelo painel admin.' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
}

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser
};
