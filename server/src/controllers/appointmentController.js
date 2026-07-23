const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAccessibleUserIds(userId, userEmail) {
  try {
    const shares = await prisma.calendarShare.findMany({
      where: {
        OR: [
          { sharedWithEmail: (userEmail || '').toLowerCase() },
          { sharedWithId: userId }
        ]
      },
      select: { ownerId: true }
    });

    const ownerIds = shares.map(s => s.ownerId);
    return Array.from(new Set([userId, ...ownerIds]));
  } catch (err) {
    console.error('Erro ao buscar permissões de agenda compartilhada:', err);
    return [userId];
  }
}

async function getAppointments(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { date, startDate, endDate, categoryId, status, priority, search } = req.query;

    const accessibleUserIds = await getAccessibleUserIds(userId, userEmail);

    // Build where clause: own appointments (all) + shared appointments (only isShared=true)
    const whereClause = {
      OR: [
        { userId },
        { userId: { in: accessibleUserIds.filter(id => id !== userId) }, isShared: true }
      ]
    };

    if (date) {
      whereClause.date = date;
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }

    if (categoryId) whereClause.categoryId = categoryId;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { tag: { contains: search } }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: true,
        confirmations: true,
        attachments: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    return res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar compromissos:', error);
    return res.status(500).json({ error: 'Erro ao buscar compromissos.' });
  }
}

async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const todayStr = new Date().toISOString().split('T')[0];

    const accessibleUserIds = await getAccessibleUserIds(userId, userEmail);

    const allUserAppointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { userId },
          { userId: { in: accessibleUserIds.filter(id => id !== userId) }, isShared: true }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: true,
        confirmations: true
      }
    });

    const todayAppointments = allUserAppointments.filter(a => a.date === todayStr);
    const upcomingAppointments = allUserAppointments.filter(a => a.date > todayStr && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
    const overdueAppointments = allUserAppointments.filter(a => a.date < todayStr && a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
    const completedAppointments = allUserAppointments.filter(a => a.status === 'COMPLETED');
    const totalAppointments = allUserAppointments.length;
    const pendingAppointments = allUserAppointments.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS');
    const cancelledAppointments = allUserAppointments.filter(a => a.status === 'CANCELLED');

    // Calculate occupied hours (estimate 1 hour per appointment unless specified)
    const totalOccupiedHours = Math.round(todayAppointments.length * 1.2 * 10) / 10;
    const estimatedFreeHours = Math.max(0, Math.round((12 - totalOccupiedHours) * 10) / 10);

    // Productivity score (Completed / (Total - Cancelled))
    const totalActive = totalAppointments - cancelledAppointments.length;
    const productivityScore = totalActive > 0 ? Math.round((completedAppointments.length / totalActive) * 100) : 100;

    // Distribution by Category
    const categoryCounts = {};
    allUserAppointments.forEach(appt => {
      const catName = appt.category?.name || 'Outros';
      const catColor = appt.category?.color || '#757575';
      if (!categoryCounts[catName]) {
        categoryCounts[catName] = { name: catName, color: catColor, count: 0 };
      }
      categoryCounts[catName].count += 1;
    });

    const categoryDistribution = Object.values(categoryCounts);

    return res.json({
      todayStr,
      today: todayAppointments,
      upcoming: upcomingAppointments.slice(0, 5),
      overdue: overdueAppointments,
      completedCount: completedAppointments.length,
      pendingCount: pendingAppointments.length,
      cancelledCount: cancelledAppointments.length,
      totalCount: totalAppointments,
      occupiedHours: totalOccupiedHours,
      freeHours: estimatedFreeHours,
      productivityScore,
      categoryDistribution
    });
  } catch (error) {
    console.error('Erro no resumo do dashboard:', error);
    return res.status(500).json({ error: 'Erro ao gerar resumo do dashboard.' });
  }
}

async function createAppointment(req, res) {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      categoryId,
      date,
      time,
      location,
      notes,
      priority,
      status,
      color,
      tag,
      isShared
    } = req.body;

    if (!title || !categoryId || !date || !time) {
      return res.status(400).json({ error: 'Título, Categoria, Data e Hora são obrigatórios.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        description: description || null,
        categoryId,
        date,
        time,
        location: location || null,
        notes: notes || null,
        priority: priority || 'NORMAL',
        status: status || 'SCHEDULED',
        color: color || null,
        tag: tag || null,
        isShared: isShared !== undefined ? Boolean(isShared) : true,
        userId
      },
      include: {
        category: true
      }
    });

    // If appointment is for today, create confirmation record
    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr) {
      await prisma.confirmation.create({
        data: {
          appointmentId: appointment.id,
          status: 'PENDING'
        }
      });
    }

    await prisma.systemLog.create({
      data: {
        userId,
        level: 'INFO',
        message: `Compromisso criado: "${title}" para ${date} às ${time}`
      }
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Erro ao criar compromisso:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar compromisso.' });
  }
}

async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Compromisso não encontrado.' });
    }

    const accessibleUserIds = await getAccessibleUserIds(userId, userEmail);
    if (!accessibleUserIds.includes(existing.userId) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const {
      title,
      description,
      categoryId,
      date,
      time,
      location,
      notes,
      priority,
      status,
      color,
      tag,
      isShared
    } = req.body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(date && { date }),
        ...(time && { time }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(color !== undefined && { color }),
        ...(tag !== undefined && { tag }),
        ...(isShared !== undefined && { isShared: Boolean(isShared) })
      },
      include: {
        category: true,
        confirmations: true
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar compromisso:', error);
    return res.status(500).json({ error: 'Erro ao atualizar compromisso.' });
  }
}

async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Compromisso não encontrado.' });
    }

    const accessibleUserIds = await getAccessibleUserIds(userId, userEmail);
    if (!accessibleUserIds.includes(existing.userId) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.appointment.delete({ where: { id } });
    return res.json({ message: 'Compromisso excluído com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir compromisso.' });
  }
}

async function exportIcs(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!appt) {
      return res.status(404).json({ error: 'Compromisso não encontrado.' });
    }

    if (appt.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    // Format date string for ICS (YYYYMMDDTHHmmssZ)
    const [year, month, day] = appt.date.split('-');
    const [hours, minutes] = appt.time.split(':');
    const dtStart = `${year}${month}${day}T${hours}${minutes}00`;
    const endHours = String((parseInt(hours) + 1) % 24).padStart(2, '0');
    const dtEnd = `${year}${month}${day}T${endHours}${minutes}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Agenda Inteligente//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appt.id}@agendainteligente.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${appt.title}`,
      `DESCRIPTION:${(appt.description || appt.notes || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${appt.location || ''}`,
      `CATEGORIES:${appt.category?.name || 'Geral'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="evento_${appt.id}.ics"`);
    return res.send(icsContent);
  } catch (error) {
    console.error('Erro ao gerar ICS:', error);
    return res.status(500).json({ error: 'Erro ao gerar arquivo de calendário.' });
  }
}

module.exports = {
  getAppointments,
  getDashboardSummary,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  exportIcs
};

