const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCategories(req, res) {
  try {
    const userId = req.user.id;
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isSystem: true },
          { userId: userId }
        ]
      },
      orderBy: { name: 'asc' }
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, color, icon } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#6750A4',
        icon: icon || 'bookmark',
        isSystem: false,
        userId
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const userId = req.user.id;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    if (existing.isSystem && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Categorias do sistema não podem ser alteradas por usuários comuns.' });
    }

    if (!existing.isSystem && existing.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permissão negada.' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon && { icon })
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    if (existing.isSystem && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Categorias do sistema não podem ser excluídas.' });
    }

    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Categoria excluída com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir categoria.' });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
