const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTodayConfirmations(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Find all appointments for today
    const appointmentsToday = await prisma.appointment.findMany({
      where: {
        userId,
        date: todayStr
      },
      include: {
        category: true,
        confirmations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { time: 'asc' }
    });

    // Ensure each today's appointment has a confirmation record
    const result = await Promise.all(
      appointmentsToday.map(async (appt) => {
        let conf = appt.confirmations[0];
        if (!conf) {
          conf = await prisma.confirmation.create({
            data: {
              appointmentId: appt.id,
              status: 'PENDING'
            }
          });
        }
        return {
          appointment: appt,
          confirmation: conf
        };
      })
    );

    return res.json(result);
  } catch (error) {
    console.error('Erro ao buscar confirmações:', error);
    return res.status(500).json({ error: 'Erro ao buscar confirmações de eventos.' });
  }
}

async function handleConfirmationAction(req, res) {
  try {
    const { appointmentId } = req.params;
    const { action, rescheduleDate, rescheduleTime, notes } = req.body;
    const userId = req.user.id;

    // Actions: 'CONFIRM', 'COMPLETE', 'RESCHEDULE', 'CANCEL'
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appt || (appt.userId !== userId && req.user.role !== 'ADMIN')) {
      return res.status(404).json({ error: 'Compromisso não encontrado ou acesso negado.' });
    }

    let updatedApptStatus = appt.status;
    let confirmationStatus = 'PENDING';

    if (action === 'CONFIRM') {
      confirmationStatus = 'CONFIRMED';
      updatedApptStatus = 'IN_PROGRESS';
    } else if (action === 'COMPLETE') {
      confirmationStatus = 'COMPLETED';
      updatedApptStatus = 'COMPLETED';
    } else if (action === 'RESCHEDULE') {
      confirmationStatus = 'RESCHEDULED';
      updatedApptStatus = 'SCHEDULED';
    } else if (action === 'CANCEL') {
      confirmationStatus = 'CANCELLED';
      updatedApptStatus = 'CANCELLED';
    }

    // Update appointment
    const apptUpdateData = { status: updatedApptStatus };
    if (action === 'RESCHEDULE' && rescheduleDate && rescheduleTime) {
      apptUpdateData.date = rescheduleDate;
      apptUpdateData.time = rescheduleTime;
    }

    const updatedAppt = await prisma.appointment.update({
      where: { id: appointmentId },
      data: apptUpdateData,
      include: { category: true }
    });

    // Create or Update confirmation entry
    const existingConf = await prisma.confirmation.findFirst({
      where: { appointmentId }
    });

    let confirmation;
    if (existingConf) {
      confirmation = await prisma.confirmation.update({
        where: { id: existingConf.id },
        data: {
          status: confirmationStatus,
          confirmedAt: new Date(),
          rescheduleDate: rescheduleDate || null,
          rescheduleTime: rescheduleTime || null,
          notes: notes || null
        }
      });
    } else {
      confirmation = await prisma.confirmation.create({
        data: {
          appointmentId,
          status: confirmationStatus,
          confirmedAt: new Date(),
          rescheduleDate: rescheduleDate || null,
          rescheduleTime: rescheduleTime || null,
          notes: notes || null
        }
      });
    }

    await prisma.systemLog.create({
      data: {
        userId,
        level: 'INFO',
        message: `Ação de confirmação (${action}) executada no compromisso "${appt.title}"`
      }
    });

    return res.json({
      message: `Compromisso atualizado com sucesso (${action}).`,
      appointment: updatedAppt,
      confirmation
    });
  } catch (error) {
    console.error('Erro na ação de confirmação:', error);
    return res.status(500).json({ error: 'Erro ao processar ação de confirmação.' });
  }
}

module.exports = {
  getTodayConfirmations,
  handleConfirmationAction
};
