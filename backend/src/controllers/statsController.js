const prisma = require('../config/database');

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        contractPercent: true,
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    // Get all pins for the user with shift weight information
    const pins = await prisma.pin.findMany({
      where: { userId },
      include: {
        shift: {
          select: {
            id: true,
            date: true,
            type: true,
            weight: true,
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

    const totalPins = pins.length;

    // Calculate average shift weight
    const shiftsWithWeights = pins.filter(pin => pin.shift.weight != null);
    const averageShiftWeight = shiftsWithWeights.length > 0 
      ? shiftsWithWeights.reduce((sum, pin) => sum + pin.shift.weight, 0) / shiftsWithWeights.length
      : null;

    // Quota simulation based on contractPercent
    // This is a simple simulation - you can adjust the logic based on business requirements
    const contractPercent = user.contractPercent;
    const fullTimeEquivalentShifts = 40; // Assume 40 shifts per period for 100% contract
    const expectedShifts = Math.round((contractPercent / 100) * fullTimeEquivalentShifts);
    const quotaSimulation = {
      contractPercent,
      expectedShifts,
      currentPins: totalPins,
      quotaStatus: totalPins >= expectedShifts ? 'met' : 'under',
      remainingNeeded: Math.max(0, expectedShifts - totalPins),
      overQuota: Math.max(0, totalPins - expectedShifts),
    };

    // Group pins by shift window for additional insights
    const pinsByWindow = pins.reduce((acc, pin) => {
      const windowId = pin.shift.shiftWindow.id;
      const windowName = pin.shift.shiftWindow.name;
      
      if (!acc[windowId]) {
        acc[windowId] = {
          windowId,
          windowName,
          pins: 0,
          totalWeight: 0,
          averageWeight: 0,
        };
      }
      
      acc[windowId].pins += 1;
      if (pin.shift.weight != null) {
        acc[windowId].totalWeight += pin.shift.weight;
        acc[windowId].averageWeight = acc[windowId].totalWeight / acc[windowId].pins;
      }
      
      return acc;
    }, {});

    res.json({
      message: 'User statistics retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contractPercent: user.contractPercent,
      },
      statistics: {
        totalPins,
        averageShiftWeight,
        quotaSimulation,
        pinsByWindow: Object.values(pinsByWindow),
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching user statistics.' 
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    // Get all shifts with pin counts and weights
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

    // Create shift popularity heatmap
    const shiftPopularityHeatmap = shifts.map(shift => ({
      id: shift.id,
      date: shift.date,
      type: shift.type,
      weight: shift.weight,
      pinCount: shift._count.pins,
      shiftWindow: shift.shiftWindow,
      popularity: shift._count.pins === 0 ? 'none' : 
                 shift._count.pins <= 2 ? 'low' :
                 shift._count.pins <= 5 ? 'medium' : 'high'
    }));

    // Get shifts with 0 pins
    const shiftsWithZeroPins = shiftPopularityHeatmap.filter(shift => shift.pinCount === 0);

    // Calculate average pins per user
    const totalUsers = await prisma.user.count();
    const totalPins = await prisma.pin.count();
    const averagePinsPerUser = totalUsers > 0 ? totalPins / totalUsers : 0;

    // Get pin distribution by user
    const usersWithPinCounts = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        contractPercent: true,
        _count: {
          select: {
            pins: true
          }
        }
      },
      orderBy: {
        pins: {
          _count: 'desc'
        }
      }
    });

    // Calculate statistics by shift window
    const windowStats = {};
    shifts.forEach(shift => {
      const windowId = shift.shiftWindow.id;
      if (!windowStats[windowId]) {
        windowStats[windowId] = {
          window: shift.shiftWindow,
          totalShifts: 0,
          totalPins: 0,
          averagePinsPerShift: 0,
          shiftsWithNoPins: 0,
          mostPopularShift: null,
          maxPins: 0,
        };
      }
      
      const stats = windowStats[windowId];
      stats.totalShifts += 1;
      stats.totalPins += shift._count.pins;
      
      if (shift._count.pins === 0) {
        stats.shiftsWithNoPins += 1;
      }
      
      if (shift._count.pins > stats.maxPins) {
        stats.maxPins = shift._count.pins;
        stats.mostPopularShift = {
          id: shift.id,
          date: shift.date,
          type: shift.type,
          pinCount: shift._count.pins,
        };
      }
      
      stats.averagePinsPerShift = stats.totalPins / stats.totalShifts;
    });

    res.json({
      message: 'Admin dashboard data retrieved successfully',
      summary: {
        totalShifts: shifts.length,
        totalPins,
        totalUsers,
        averagePinsPerUser: Math.round(averagePinsPerUser * 100) / 100,
        shiftsWithZeroPins: shiftsWithZeroPins.length,
      },
      shiftPopularityHeatmap,
      shiftsWithZeroPins,
      windowStatistics: Object.values(windowStats),
      topUsers: usersWithPinCounts.slice(0, 10).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        contractPercent: user.contractPercent,
        pinCount: user._count.pins,
      })),
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching admin dashboard data.' 
    });
  }
};

module.exports = {
  getUserStats,
  getAdminDashboard,
}; 