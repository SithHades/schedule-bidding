const prisma = require('../config/database');

const createShiftWindow = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Name, startDate, and endDate are required.' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use ISO 8601 format.' 
      });
    }

    if (start >= end) {
      return res.status(400).json({ 
        error: 'Start date must be before end date.' 
      });
    }

    // Create shift window
    const shiftWindow = await prisma.shiftWindow.create({
      data: {
        name,
        startDate: start,
        endDate: end,
      }
    });

    res.status(201).json({
      message: 'Shift window created successfully',
      shiftWindow,
    });
  } catch (error) {
    console.error('Create shift window error:', error);
    res.status(500).json({ 
      error: 'Internal server error while creating shift window.' 
    });
  }
};

const getAllShiftWindows = async (req, res) => {
  try {
    const shiftWindows = await prisma.shiftWindow.findMany({
      include: {
        _count: {
          select: {
            shifts: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      message: 'Shift windows retrieved successfully',
      shiftWindows,
      count: shiftWindows.length,
    });
  } catch (error) {
    console.error('Get shift windows error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching shift windows.' 
    });
  }
};

const updateShiftWindow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;

    // Check if shift window exists
    const existingWindow = await prisma.shiftWindow.findUnique({
      where: { id }
    });

    if (!existingWindow) {
      return res.status(404).json({ 
        error: 'Shift window not found.' 
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid startDate format. Use ISO 8601 format.' 
        });
      }
      updateData.startDate = start;
    }
    if (endDate !== undefined) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid endDate format. Use ISO 8601 format.' 
        });
      }
      updateData.endDate = end;
    }

    // Validate date range if both dates are being updated
    const finalStartDate = updateData.startDate || existingWindow.startDate;
    const finalEndDate = updateData.endDate || existingWindow.endDate;
    
    if (finalStartDate >= finalEndDate) {
      return res.status(400).json({ 
        error: 'Start date must be before end date.' 
      });
    }

    // Update shift window
    const updatedWindow = await prisma.shiftWindow.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Shift window updated successfully',
      shiftWindow: updatedWindow,
    });
  } catch (error) {
    console.error('Update shift window error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating shift window.' 
    });
  }
};

const deleteShiftWindow = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if shift window exists
    const existingWindow = await prisma.shiftWindow.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shifts: true
          }
        }
      }
    });

    if (!existingWindow) {
      return res.status(404).json({ 
        error: 'Shift window not found.' 
      });
    }

    // Delete shift window (cascades to shifts and pins)
    await prisma.shiftWindow.delete({
      where: { id }
    });

    res.json({
      message: 'Shift window deleted successfully',
      deletedShifts: existingWindow._count.shifts,
    });
  } catch (error) {
    console.error('Delete shift window error:', error);
    res.status(500).json({ 
      error: 'Internal server error while deleting shift window.' 
    });
  }
};

module.exports = {
  createShiftWindow,
  getAllShiftWindows,
  updateShiftWindow,
  deleteShiftWindow,
}; 