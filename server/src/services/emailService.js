const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Setup Nodemailer Transporter (Uses Ethereal or configured SMTP)
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate Ethereal test account for dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✉️ Email de teste configurado via Ethereal: ${testAccount.user}`);
  }
  return transporter;
}

function generateDailyEmailHtml(user, appointments, greetingPeriod = 'Bom dia') {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const appointmentItemsHtml = appointments.map((appt) => {
    const confirmUrl = `${clientUrl}/confirmacoes?id=${appt.id}&action=CONFIRM`;
    const completeUrl = `${clientUrl}/confirmacoes?id=${appt.id}&action=COMPLETE`;

    return `
      <div style="background-color: #F7F2FA; border-left: 4px solid ${appt.category?.color || '#6750A4'}; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="background-color: #E8DEF8; color: #1D192B; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold;">
            ${appt.time} - ${appt.category?.name || 'Geral'}
          </span>
          <span style="font-size: 12px; color: #625B71; font-weight: 500;">
            Prioridade: ${appt.priority}
          </span>
        </div>
        <h3 style="margin: 10px 0 6px 0; color: #1D192B; font-size: 16px;">${appt.title}</h3>
        ${appt.description ? `<p style="margin: 0 0 10px 0; color: #49454F; font-size: 14px;">${appt.description}</p>` : ''}
        ${appt.location ? `<p style="margin: 0 0 12px 0; color: #625B71; font-size: 13px;">📍 ${appt.location}</p>` : ''}
        
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <a href="${confirmUrl}" style="background-color: #6750A4; color: #FFFFFF; text-decoration: none; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block;">
            ✔ Confirmar Presença
          </a>
          <a href="${completeUrl}" style="background-color: #1E88E5; color: #FFFFFF; text-decoration: none; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block; margin-left: 8px;">
            ✔ Concluir Compromisso
          </a>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Plus Jakarta Sans', Roboto, Arial, sans-serif; background-color: #FEF7FF; margin: 0; padding: 20px; color: #1D192B; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 28px; box-shadow: 0px 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 1px solid #CAC4D0; padding-bottom: 20px; margin-bottom: 24px; }
        .footer { text-align: center; font-size: 12px; color: #79747E; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="color: #6750A4; margin: 0;">📅 Agenda Inteligente</h2>
          <p style="color: #49454F; margin: 6px 0 0 0; font-size: 14px;">Resumo Diário - ${todayStr}</p>
        </div>

        <p style="font-size: 16px; font-weight: 600;">${greetingPeriod}, ${user.name}!</p>
        <p style="font-size: 14px; color: #49454F;">
          ${appointments.length > 0 
            ? `Hoje você possui <strong>${appointments.length} compromisso(s)</strong> agendados:` 
            : 'Sua agenda está livre para o dia de hoje! Aproveite o seu tempo livre.'}
        </p>

        ${appointmentItemsHtml}

        <div style="text-align: center; margin-top: 28px;">
          <a href="${clientUrl}" style="background-color: #43A047; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 28px; font-size: 14px; font-weight: 700; display: inline-block;">
            Abrir Agenda Inteligente
          </a>
        </div>

        <div class="footer">
          <p>Esta é uma notificação automática do sistema Agenda Inteligente.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendDailyDigest(period = '07:00') {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const greeting = period === '07:00' ? 'Bom dia' : 'Boa tarde';

    // Find users with email notifications enabled
    const users = await prisma.user.findMany({
      include: {
        settings: true,
        appointments: {
          where: {
            date: todayStr,
            status: { not: 'CANCELLED' }
          },
          include: { category: true }
        }
      }
    });

    const activeTransporter = await getTransporter();

    for (const user of users) {
      if (user.settings && !user.settings.emailEnabled) continue;

      const htmlContent = generateDailyEmailHtml(user, user.appointments, greeting);

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Agenda Inteligente" <notificacoes@agendainteligente.app>',
        to: user.email,
        subject: `📅 ${greeting}! Seus compromissos de hoje (${todayStr})`,
        html: htmlContent
      };

      const info = await activeTransporter.sendMail(mailOptions);
      console.log(`✉️ Email enviado para ${user.email} (${period}). ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`   🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `${greeting}! Compromissos do Dia`,
          message: `Enviado e-mail do período de ${period} com ${user.appointments.length} compromissos.`,
          type: 'EMAIL',
          status: 'SENT',
          sentAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('❌ Erro no envio de e-mails diários:', error);
  }
}

module.exports = {
  sendDailyDigest,
  getTransporter
};
