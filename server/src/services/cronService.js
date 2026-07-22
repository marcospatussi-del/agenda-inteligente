const cron = require('node-cron');
const { sendDailyDigest } = require('./emailService');

function initCronJobs() {
  console.log('⏰ Inicializando agendamentos automáticos (node-cron)...');

  // Daily Morning Cron at 07:00
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Executando agendamento das 07:00 (Envio de resumo diário)...');
    await sendDailyDigest('07:00');
  });

  // Daily Afternoon Cron at 12:00
  cron.schedule('0 12 * * *', async () => {
    console.log('⏰ Executando agendamento das 12:00 (Envio de resumo diário)...');
    await sendDailyDigest('12:00');
  });

  console.log('✅ Cron jobs agendados para 07:00 e 12:00 todos os dias.');
}

module.exports = {
  initCronJobs
};
