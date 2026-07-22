const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Trabalho', color: '#1E88E5', icon: 'work', isSystem: true },
  { name: 'Estudo', color: '#8E24AA', icon: 'school', isSystem: true },
  { name: 'Reunião', color: '#D81B60', icon: 'groups', isSystem: true },
  { name: 'Médico', color: '#E53935', icon: 'medical_services', isSystem: true },
  { name: 'Financeiro', color: '#43A047', icon: 'account_balance', isSystem: true },
  { name: 'Família', color: '#FB8C00', icon: 'family_restroom', isSystem: true },
  { name: 'Compras', color: '#00ACC1', icon: 'shopping_cart', isSystem: true },
  { name: 'Aniversários', color: '#F4511E', icon: 'cake', isSystem: true },
  { name: 'Outros', color: '#757575', icon: 'more_horiz', isSystem: true },
];

async function main() {
  console.log('🌱 Iniciando inclusão de dados no banco (Seed)...');

  // Clear existing
  await prisma.confirmation.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.systemLog.deleteMany({});
  await prisma.settings.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Categories
  const createdCategories = {};
  for (const cat of defaultCategories) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.name] = created.id;
  }
  console.log('✅ Categorias padrão criadas.');

  // Password Hash
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashUser = await bcrypt.hash('user123', 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador Agenda',
      email: 'admin@agenda.com',
      phone: '(11) 99999-8888',
      password: passwordHashAdmin,
      role: 'ADMIN',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      settings: {
        create: {
          morningEmail: '07:00',
          afternoonEmail: '12:00',
          emailEnabled: true,
          pushEnabled: true,
          themePreference: 'light'
        }
      }
    }
  });

  // Normal User
  const normalUser = await prisma.user.create({
    data: {
      name: 'Carlos Eduardo',
      email: 'carlos@agenda.com',
      phone: '(11) 98765-4321',
      password: passwordHashUser,
      role: 'USER',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      settings: {
        create: {
          morningEmail: '07:00',
          afternoonEmail: '12:00',
          emailEnabled: true,
          pushEnabled: true,
          themePreference: 'light'
        }
      }
    }
  });

  console.log('✅ Usuários de teste criados:');
  console.log('   - Admin: admin@agenda.com / admin123');
  console.log('   - Usuário: carlos@agenda.com / user123');

  // Dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Appointments for Carlos
  const sampleAppointments = [
    {
      title: 'Reunião de Alinhamento de Projetos Q3',
      description: 'Reunião com a equipe de desenvolvimento para revisar prazos e entregáveis.',
      date: today,
      time: '09:00',
      location: 'Sala de Reuniões 3 & Google Meet',
      notes: 'Trazer métricas de desempenho e atualizações do sprint anterior.',
      priority: 'VERY_HIGH',
      status: 'SCHEDULED',
      color: '#1E88E5',
      tag: 'Estratégico',
      categoryId: createdCategories['Reunião'],
      userId: normalUser.id,
    },
    {
      title: 'Consulta Médica de Rotina',
      description: 'Exames anuais de cardiologia e sangue.',
      date: today,
      time: '11:30',
      location: 'Hospital Albert Einstein - Bloco B',
      notes: 'Jejum obrigatório de 8 horas.',
      priority: 'HIGH',
      status: 'SCHEDULED',
      color: '#E53935',
      tag: 'Saúde',
      categoryId: createdCategories['Médico'],
      userId: normalUser.id,
    },
    {
      title: 'Pagamento da Fatura do Cartão',
      description: 'Efetuar quitação do cartão corporativo.',
      date: today,
      time: '14:00',
      location: 'Internet Banking',
      notes: 'Conferir comprovante de retenção.',
      priority: 'HIGH',
      status: 'SCHEDULED',
      color: '#43A047',
      tag: 'Contas',
      categoryId: createdCategories['Financeiro'],
      userId: normalUser.id,
    },
    {
      title: 'Curso de React & Design System',
      description: 'Módulo 4: Animações e componentes responsivos com Material Design 3.',
      date: today,
      time: '16:30',
      location: 'Plataforma Online',
      notes: 'Realizar exercícios do capítulo 2.',
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      color: '#8E24AA',
      tag: 'Estudos',
      categoryId: createdCategories['Estudo'],
      userId: normalUser.id,
    },
    {
      title: 'Jantar em Família - Aniversário da Mãe',
      description: 'Comemoração dos 60 anos no restaurante italiano.',
      date: today,
      time: '20:00',
      location: 'Cantina Bella Italia',
      notes: 'Levar o presente que está guardado no armário.',
      priority: 'VERY_HIGH',
      status: 'SCHEDULED',
      color: '#FB8C00',
      tag: 'Aniversário',
      categoryId: createdCategories['Família'],
      userId: normalUser.id,
    },
    // Past Overdue / Completed
    {
      title: 'Revisão do Orçamento Trimestral',
      description: 'Ajustar relatórios financeiros.',
      date: yesterday,
      time: '15:00',
      location: 'Escritório Central',
      notes: 'Enviado para aprovação da diretoria.',
      priority: 'HIGH',
      status: 'COMPLETED',
      color: '#43A047',
      tag: 'Financeiro',
      categoryId: createdCategories['Financeiro'],
      userId: normalUser.id,
    },
    {
      title: 'Renovar Seguro do Carro',
      description: 'Cotações recebidas da corretora.',
      date: yesterday,
      time: '10:00',
      location: 'Telefone',
      notes: 'Pendente envio de comprovante de residência.',
      priority: 'VERY_HIGH',
      status: 'SCHEDULED', // Overdue!
      color: '#E53935',
      tag: 'Urgente',
      categoryId: createdCategories['Outros'],
      userId: normalUser.id,
    },
    // Tomorrow
    {
      title: 'Workshop de Arquitetura de Software',
      description: 'Palestra sobre microserviços e alta disponibilidade.',
      date: tomorrow,
      time: '10:00',
      location: 'Auditório Principal - Centro de Convenções',
      notes: 'Inscrição confirmada via email.',
      priority: 'NORMAL',
      status: 'SCHEDULED',
      color: '#1E88E5',
      tag: 'Tech',
      categoryId: createdCategories['Trabalho'],
      userId: normalUser.id,
    }
  ];

  for (const item of sampleAppointments) {
    const appt = await prisma.appointment.create({ data: item });
    // Create initial confirmation entry for today's items
    if (item.date === today) {
      await prisma.confirmation.create({
        data: {
          appointmentId: appt.id,
          status: 'PENDING'
        }
      });
    }
  }

  // Add system logs
  await prisma.systemLog.create({
    data: {
      userId: adminUser.id,
      level: 'INFO',
      message: 'Sistema inicializado e populado com dados de teste com sucesso.'
    }
  });

  console.log('✅ Compromissos e confirmações de exemplo inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
