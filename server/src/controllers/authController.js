const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

async function register(req, res) {
  try {
    const { name, email, password, phone, photo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6750A4&color=fff`,
        settings: {
          create: {
            morningEmail: '07:00',
            afternoonEmail: '12:00',
            emailEnabled: true,
            pushEnabled: true,
            themePreference: 'light'
          }
        }
      },
      include: {
        settings: true
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await prisma.systemLog.create({
      data: {
        userId: user.id,
        level: 'INFO',
        message: `Novo usuário registrado: ${user.email}`
      }
    });

    const { password: _, ...userData } = user;
    return res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await prisma.systemLog.create({
      data: {
        userId: user.id,
        level: 'INFO',
        message: `Login efetuado: ${user.email}`
      }
    });

    const { password: _, ...userData } = user;
    return res.json({ user: userData, token });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

async function googleLogin(req, res) {
  try {
    const { email, name, photo, googleId } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Dados do Google insuficientes.' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId: googleId || 'google_mock_id',
          password: dummyPassword,
          photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          settings: {
            create: {
              morningEmail: '07:00',
              afternoonEmail: '12:00',
              emailEnabled: true,
              pushEnabled: true
            }
          }
        },
        include: { settings: true }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userData } = user;
    return res.json({ user: userData, token });
  } catch (error) {
    console.error('Erro no Google Login:', error);
    return res.status(500).json({ error: 'Erro ao autenticar com Google.' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { settings: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const { password: _, ...userData } = user;
    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, photo, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (photo !== undefined) updateData.photo = photo;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { settings: true }
    });

    const { password: _, ...userData } = user;
    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
}

async function updateSettings(req, res) {
  try {
    const { morningEmail, afternoonEmail, emailEnabled, pushEnabled, themePreference } = req.body;

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(morningEmail && { morningEmail }),
        ...(afternoonEmail && { afternoonEmail }),
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(themePreference && { themePreference })
      },
      create: {
        userId: req.user.id,
        morningEmail: morningEmail || '07:00',
        afternoonEmail: afternoonEmail || '12:00',
        emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
        pushEnabled: pushEnabled !== undefined ? pushEnabled : true,
        themePreference: themePreference || 'light'
      }
    });

    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  updateSettings
};
