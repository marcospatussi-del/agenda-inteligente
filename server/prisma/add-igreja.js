const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.category.findFirst({ where: { name: 'Igreja' } });
  if (existing) {
    console.log('✅ Categoria "Igreja" já existe:', existing.id);
    return;
  }

  const cat = await prisma.category.create({
    data: {
      name: 'Igreja',
      color: '#6D4C41',
      icon: 'church',
      isSystem: true,
    },
  });
  console.log('✅ Categoria "Igreja" criada com sucesso:', cat.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
