const prisma = require('../config/database');

const createPin = async (req, res) => {
  try {
    const { userId, shiftId } = req.body;

    // Validate required fields
    if (!userId || !shiftId) {
      return res.status(400).json({ 
        error: 'userId and shiftId are required.' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    // Check if shift exists and get shift window info
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        shiftWindow: true
      }
    });

    if (!shift) {
      return res.status(404).json({ 
        error: 'Shift not found.' 
      });
    }

    // Check if shift is within an active window (shift date within window dates)
    const now = new Date();
    const shiftDate = new Date(shift.date);
    const windowStart = new Date(shift.shiftWindow.startDate);
    const windowEnd = new Date(shift.shiftWindow.endDate);

    if (shiftDate < windowStart || shiftDate > windowEnd) {
      return res.status(400).json({ 
        error: 'Cannot pin shifts outside the shift window timeframe.' 
      });
    }

    // Check if user already has a pin for this shift
    const existingPin = await prisma.pin.findUnique({
      where: {
        userId_shiftId: {
          userId,
          shiftId
        }
      }
    });

    if (existingPin) {
      return res.status(409).json({ 
        error: 'User has already pinned this shift.' 
      });
    }

    // Create the pin
    const pin = await prisma.pin.create({
      data: {
        userId,
        shiftId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        shift: {
          select: {
            id: true,
            date: true,
            type: true,
            shiftWindow: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Pin created successfully',
      pin,
    });
  } catch (error) {
    console.error('Create pin error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating pin.' 
    });
  }
};

const getUserPins = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    // Get all pins for the user
    const pins = await prisma.pin.findMany({
      where: { userId },
      include: {
        shift: {
          select: {
            id: true,
            date: true,
            type: true,
            shiftWindow: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
              }
            }
          }
        }
      },
      orderBy: [
        { shift: { date: 'asc' } },
        { shift: { type: 'asc' } }
      ]
    });

    // Group pins by shift window for better organization
    const pinsByWindow = pins.reduce((acc, pin) => {
      const windowId = pin.shift.shiftWindow.id;
      if (!acc[windowId]) {
        acc[windowId] = {
          window: pin.shift.shiftWindow,
          pins: []
        };
      }
      acc[windowId].pins.push({
        shiftId: pin.shiftId,
        date: pin.shift.date,
        type: pin.shift.type,
        createdAt: pin.createdAt,
      });
      return acc;
    }, {});

    res.json({
      message: 'User pins retrieved successfully',
      user,
      data: Object.values(pinsByWindow),
      totalPins: pins.length,
    });
  } catch (error) {
    console.error('Get user pins error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching user pins.' 
    });
  }
};

module.exports = {
  createPin,
  getUserPins,
}; 