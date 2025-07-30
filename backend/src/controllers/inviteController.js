const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const createInvite = async (req, res) => {
  try {
    const { email, contractPercent, role } = req.body;

    // Validate required fields
    if (!email || contractPercent === undefined || !role) {
      return res.status(400).json({ 
        error: 'Email, contractPercent, and role are required.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format.' 
      });
    }

    // Validate contractPercent
    if (contractPercent < 0 || contractPercent > 100) {
      return res.status(400).json({ 
        error: 'Contract percent must be between 0 and 100.' 
      });
    }

    // Validate role
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be either USER or ADMIN.' 
      });
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists.' 
      });
    }

    // Check if there's already an unused invite for this email
    const existingInvite = await prisma.inviteToken.findFirst({
      where: { 
        email,
        used: false 
      }
    });

    if (existingInvite) {
      return res.status(409).json({ 
        error: 'An unused invite for this email already exists.' 
      });
    }

    // Create invite token
    const invite = await prisma.inviteToken.create({
      data: {
        email,
        contractPercent,
        role,
      },
      select: {
        id: true,
        email: true,
        token: true,
        contractPercent: true,
        role: true,
        createdAt: true,
      }
    });

    // Generate the full invite URL
    const inviteUrl = `http://localhost:3000/invite/${invite.token}`;

    res.status(201).json({
      message: 'Invite created successfully',
      invite,
      inviteUrl,
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ 
      error: 'Internal server error during invite creation.' 
    });
  }
};

const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required.' 
      });
    }

    // Find the invite token
    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        contractPercent: true,
        role: true,
        used: true,
        createdAt: true,
        usedAt: true,
      }
    });

    if (!invite) {
      return res.status(404).json({ 
        error: 'Invite token not found.' 
      });
    }

    if (invite.used) {
      return res.status(410).json({ 
        error: 'Invite token has already been used.' 
      });
    }

    res.json({
      message: 'Invite found',
      invite,
    });
  } catch (error) {
    console.error('Get invite error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching invite.' 
    });
  }
};

const signupViaInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Validate required fields
    if (!token || !name || !password) {
      return res.status(400).json({ 
        error: 'Token, name, and password are required.' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long.' 
      });
    }

    // Find and validate the invite token
    const invite = await prisma.inviteToken.findUnique({
      where: { token }
    });

    if (!invite) {
      return res.status(404).json({ 
        error: 'Invalid invite token.' 
      });
    }

    if (invite.used) {
      return res.status(410).json({ 
        error: 'Invite token has already been used.' 
      });
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists.' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Use a transaction to create user and mark invite as used
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email: invite.email,
          password: hashedPassword,
          contractPercent: invite.contractPercent,
          role: invite.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          contractPercent: true,
          role: true,
          createdAt: true,
        }
      });

      // Mark invite as used
      await prisma.inviteToken.update({
        where: { id: invite.id },
        data: {
          used: true,
          usedAt: new Date(),
        }
      });

      return user;
    });

    // Generate token
    const authToken = generateToken({ userId: result.id });

    res.status(201).json({
      message: 'User registered successfully via invite',
      user: result,
      token: authToken,
    });
  } catch (error) {
    console.error('Signup via invite error:', error);
    res.status(500).json({ 
      error: 'Internal server error during signup.' 
    });
  }
};

const getAllInvites = async (req, res) => {
  try {
    const invites = await prisma.inviteToken.findMany({
      select: {
        id: true,
        email: true,
        token: true,
        contractPercent: true,
        role: true,
        used: true,
        createdAt: true,
        usedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Invites retrieved successfully',
      invites,
      count: invites.length,
    });
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching invites.' 
    });
  }
};

module.exports = {
  createInvite,
  getInviteByToken,
  signupViaInvite,
  getAllInvites,
}; 