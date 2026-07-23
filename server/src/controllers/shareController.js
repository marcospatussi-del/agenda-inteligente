const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function shareCalendar(req, res) {
  try {
    const ownerId = req.user.id;
    const ownerEmail = req.user.email;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'O e-mail do destinatário é obrigatório.' });
    }

    const targetEmail = email.trim().toLowerCase();

    if (targetEmail === ownerEmail.toLowerCase()) {
      return res.status(400).json({ error: 'Você não pode compartilhar a agenda com seu próprio e-mail.' });
    }

    // Find if user already exists
    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    const share = await prisma.calendarShare.upsert({
      where: {
        ownerId_sharedWithEmail: {
          ownerId,
          sharedWithEmail: targetEmail
        }
      },
      update: {
        sharedWithId: targetUser ? targetUser.id : null,
        canEdit: true
      },
      create: {
        ownerId,
        sharedWithEmail: targetEmail,
        sharedWithId: targetUser ? targetUser.id : null,
        canEdit: true
      },
      include: {
        sharedWithUser: {
          select: { id: true, name: true, email: true, photo: true }
        }
      }
    });

    await prisma.systemLog.create({
      data: {
        userId: ownerId,
        level: 'INFO',
        message: `Agenda compartilhada com ${targetEmail}`
      }
    });

    return res.status(201).json({
      message: `Agenda compartilhada com ${targetEmail} com sucesso!`,
      share
    });
  } catch (error) {
    console.error('Erro ao compartilhar agenda:', error);
    return res.status(500).json({ error: 'Erro ao compartilhar agenda.' });
  }
}

async function getShares(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase();

    const createdShares = await prisma.calendarShare.findMany({
      where: { ownerId: userId },
      include: {
        sharedWithUser: {
          select: { id: true, name: true, email: true, photo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const receivedShares = await prisma.calendarShare.findMany({
      where: {
        OR: [
          { sharedWithEmail: userEmail },
          { sharedWithId: userId }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, photo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      createdShares,
      receivedShares
    });
  } catch (error) {
    console.error('Erro ao buscar compartilhamentos:', error);
    return res.status(500).json({ error: 'Erro ao buscar compartilhamentos.' });
  }
}

async function deleteShare(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase();

    const share = await prisma.calendarShare.findUnique({
      where: { id }
    });

    if (!share) {
      return res.status(404).json({ error: 'Compartilhamento não encontrado.' });
    }

    // Only owner or recipient can remove
    if (share.ownerId !== userId && share.sharedWithEmail.toLowerCase() !== userEmail && share.sharedWithId !== userId) {
      return res.status(403).json({ error: 'Acesso negado para remover este compartilhamento.' });
    }

    await prisma.calendarShare.delete({
      where: { id }
    });

    return res.json({ message: 'Compartilhamento revogado com sucesso.' });
  } catch (error) {
    console.error('Erro ao revogar compartilhamento:', error);
    return res.status(500).json({ error: 'Erro ao revogar compartilhamento.' });
  }
}

module.exports = {
  shareCalendar,
  getShares,
  deleteShare
};
