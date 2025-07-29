const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, contractPercent, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format.' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long.' 
      });
    }

    // Validate contractPercent if provided
    if (contractPercent !== undefined && (contractPercent < 0 || contractPercent > 100)) {
      return res.status(400).json({ 
        error: 'Contract percent must be between 0 and 100.' 
      });
    }

    // Validate role if provided
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be either USER or ADMIN.' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists.' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contractPercent: contractPercent || 100,
        role: role || 'USER',
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

    // Generate token
    const token = generateToken({ userId: user.id });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration.' 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        contractPercent: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Users retrieved successfully',
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching users.' 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { contractPercent, role } = req.body;

    // Validate that at least one field is provided
    if (contractPercent === undefined && role === undefined) {
      return res.status(400).json({ 
        error: 'At least one field (contractPercent or role) must be provided.' 
      });
    }

    // Validate contractPercent if provided
    if (contractPercent !== undefined && (contractPercent < 0 || contractPercent > 100)) {
      return res.status(400).json({ 
        error: 'Contract percent must be between 0 and 100.' 
      });
    }

    // Validate role if provided
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be either USER or ADMIN.' 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (contractPercent !== undefined) updateData.contractPercent = contractPercent;
    if (role !== undefined) updateData.role = role;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        contractPercent: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating user.' 
    });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  updateUser,
}; 