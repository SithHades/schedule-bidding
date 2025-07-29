const prisma = require('../config/database');

const getShiftsByWindow = async (req, res) => {
  try {
    const { windowId } = req.query;

    // Validate windowId parameter
    if (!windowId) {
      return res.status(400).json({ 
        error: 'windowId query parameter is required.' 
      });
    }

    // Check if shift window exists
    const shiftWindow = await prisma.shiftWindow.findUnique({
      where: { id: windowId }
    });

    if (!shiftWindow) {
      return res.status(404).json({ 
        error: 'Shift window not found.' 
      });
    }

    // Get all shifts in the window
    const shifts = await prisma.shift.findMany({
      where: { shiftWindowId: windowId },
      include: {
        shiftWindow: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          }
        },
        _count: {
          select: {
            pins: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { type: 'asc' }
      ]
    });

    res.json({
      message: 'Shifts retrieved successfully',
      shifts,
      shiftWindow: {
        id: shiftWindow.id,
        name: shiftWindow.name,
        startDate: shiftWindow.startDate,
        endDate: shiftWindow.endDate,
      },
      count: shifts.length,
    });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching shifts.' 
    });
  }
};

const getShiftStats = async (req, res) => {
  try {
    // Get all shifts with pin counts
    const shifts = await prisma.shift.findMany({
      include: {
        shiftWindow: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          }
        },
        _count: {
          select: {
            pins: true
          }
        }
      },
      orderBy: [
        { shiftWindow: { startDate: 'desc' } },
        { date: 'asc' },
        { type: 'asc' }
      ]
    });

    // Group by shift window for better organization
    const shiftsByWindow = shifts.reduce((acc, shift) => {
      const windowId = shift.shiftWindow.id;
      if (!acc[windowId]) {
        acc[windowId] = {
          window: shift.shiftWindow,
          shifts: []
        };
      }
      acc[windowId].shifts.push({
        id: shift.id,
        date: shift.date,
        type: shift.type,
        pinCount: shift._count.pins,
        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt,
      });
      return acc;
    }, {});

    res.json({
      message: 'Shift statistics retrieved successfully',
      data: Object.values(shiftsByWindow),
      totalShifts: shifts.length,
      totalPins: shifts.reduce((sum, shift) => sum + shift._count.pins, 0),
    });
  } catch (error) {
    console.error('Get shift stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching shift statistics.' 
    });
  }
};

const createShift = async (req, res) => {
  try {
    const { date, type, shiftWindowId } = req.body;

    // Validate required fields
    if (!date || !type || !shiftWindowId) {
      return res.status(400).json({ 
        error: 'Date, type, and shiftWindowId are required.' 
      });
    }

    // Validate shift type
    if (!['EARLY', 'LATE'].includes(type)) {
      return res.status(400).json({ 
        error: 'Type must be either EARLY or LATE.' 
      });
    }

    // Validate date format
    const shiftDate = new Date(date);
    if (isNaN(shiftDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use ISO 8601 format.' 
      });
    }

    // Check if shift window exists
    const shiftWindow = await prisma.shiftWindow.findUnique({
      where: { id: shiftWindowId }
    });

    if (!shiftWindow) {
      return res.status(404).json({ 
        error: 'Shift window not found.' 
      });
    }

    // Validate that shift date is within window range
    if (shiftDate < shiftWindow.startDate || shiftDate > shiftWindow.endDate) {
      return res.status(400).json({ 
        error: 'Shift date must be within the shift window date range.' 
      });
    }

    // Check if shift already exists for this date and type in this window
    const existingShift = await prisma.shift.findFirst({
      where: {
        date: shiftDate,
        type,
        shiftWindowId
      }
    });

    if (existingShift) {
      return res.status(409).json({ 
        error: 'A shift with this date and type already exists in this window.' 
      });
    }

    // Create shift
    const shift = await prisma.shift.create({
      data: {
        date: shiftDate,
        type,
        shiftWindowId,
      },
      include: {
        shiftWindow: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          }
        }
      }
    });

    res.status(201).json({
      message: 'Shift created successfully',
      shift,
    });
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating shift.' 
    });
  }
};

const createBulkShifts = async (req, res) => {
  try {
    const { shifts } = req.body;

    // Validate shifts array
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return res.status(400).json({ 
        error: 'Shifts array is required and cannot be empty.' 
      });
    }

    // Validate each shift
    for (let i = 0; i < shifts.length; i++) {
      const shift = shifts[i];
      if (!shift.date || !shift.type || !shift.shiftWindowId) {
        return res.status(400).json({ 
          error: `Shift at index ${i}: date, type, and shiftWindowId are required.` 
        });
      }

      if (!['EARLY', 'LATE'].includes(shift.type)) {
        return res.status(400).json({ 
          error: `Shift at index ${i}: type must be either EARLY or LATE.` 
        });
      }

      const shiftDate = new Date(shift.date);
      if (isNaN(shiftDate.getTime())) {
        return res.status(400).json({ 
          error: `Shift at index ${i}: invalid date format. Use ISO 8601 format.` 
        });
      }
    }

    // Create shifts in a transaction
    const createdShifts = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const shiftData of shifts) {
        const shiftDate = new Date(shiftData.date);
        
        // Check if shift window exists
        const shiftWindow = await tx.shiftWindow.findUnique({
          where: { id: shiftData.shiftWindowId }
        });

        if (!shiftWindow) {
          throw new Error(`Shift window not found: ${shiftData.shiftWindowId}`);
        }

        // Check if shift already exists
        const existingShift = await tx.shift.findFirst({
          where: {
            date: shiftDate,
            type: shiftData.type,
            shiftWindowId: shiftData.shiftWindowId
          }
        });

        if (!existingShift) {
          const shift = await tx.shift.create({
            data: {
              date: shiftDate,
              type: shiftData.type,
              shiftWindowId: shiftData.shiftWindowId,
            },
            include: {
              shiftWindow: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          });
          results.push(shift);
        }
      }
      
      return results;
    });

    res.status(201).json({
      message: 'Bulk shifts created successfully',
      shifts: createdShifts,
      created: createdShifts.length,
      skipped: shifts.length - createdShifts.length,
    });
  } catch (error) {
    console.error('Create bulk shifts error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating bulk shifts.' 
    });
  }
};

const updateShiftWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const { weight } = req.body;

    // Validate weight
    if (weight === undefined || weight === null) {
      return res.status(400).json({ 
        error: 'Weight is required.' 
      });
    }

    if (typeof weight !== 'number' || weight < 0) {
      return res.status(400).json({ 
        error: 'Weight must be a non-negative number.' 
      });
    }

    // Check if shift exists
    const existingShift = await prisma.shift.findUnique({
      where: { id },
      include: {
        shiftWindow: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            pins: true
          }
        }
      }
    });

    if (!existingShift) {
      return res.status(404).json({ 
        error: 'Shift not found.' 
      });
    }

    // Update shift weight
    const updatedShift = await prisma.shift.update({
      where: { id },
      data: { weight },
      include: {
        shiftWindow: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          }
        },
        _count: {
          select: {
            pins: true
          }
        }
      }
    });

    res.json({
      message: 'Shift weight updated successfully',
      shift: {
        id: updatedShift.id,
        date: updatedShift.date,
        type: updatedShift.type,
        weight: updatedShift.weight,
        pinCount: updatedShift._count.pins,
        shiftWindow: updatedShift.shiftWindow,
        createdAt: updatedShift.createdAt,
        updatedAt: updatedShift.updatedAt,
      },
      previousWeight: existingShift.weight,
    });
  } catch (error) {
    console.error('Update shift weight error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating shift weight.' 
    });
  }
};

module.exports = {
  getShiftsByWindow,
  getShiftStats,
  createShift,
  createBulkShifts,
  updateShiftWeight,
}; 