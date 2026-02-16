import LeadAssignment from '../models/leadAssignment.model.js';
import Lead from '../models/lead.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Assign a lead to a user
 * @route   POST /api/assignments
 * @access  Admin / Manager
 */
export const assignLead = async (req, res, next) => {
  try {
    const { leadId, assignedTo, note } = req.body;

    // Validate lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Validate user exists
    const user = await User.findById(assignedTo);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Role-based assignment rules
    if (req.user.role === 'admin' && user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Admin can only assign leads to Manager' });
    }

    if (req.user.role === 'manager' && user.role !== 'sales') {
      return res.status(403).json({ success: false, message: 'Manager can only assign leads to Sales' });
    }

    if (req.user.role === 'sales') {
      return res.status(403).json({ success: false, message: 'Sales cannot assign leads' });
    }

    // Create assignment
    const assignment = await LeadAssignment.create({
      lead: leadId,
      assignedTo,
      assignedBy: req.user._id,
      note,
      isActive: true, // default
    });

    // Update lead's assignedTo field
    lead.assignedTo = assignedTo;
    await lead.save();

    res.status(201).json({ success: true, message: 'Lead assigned successfully', data: assignment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all assignments (with optional filters)
 * @route   GET /api/assignments
 * @access  Admin / Manager/ Sales (with role-based visibility)
 */
export const getAllAssignments = async (req, res, next) => {
  try {
    const { assignedTo, leadId, isActive } = req.query;

    const filter = {};

    // Apply query filters if provided
    if (assignedTo) filter.assignedTo = assignedTo;
    if (leadId) filter.lead = leadId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Role-based visibility
    if (req.user.role === 'manager') {
      // Manager sees:
      // 1. Assignments they made (assignedBy = manager)
      // 2. Assignments assigned to Sales under them (optional: could filter by team)
      filter.$or = [
        { assignedBy: req.user._id },  // assignments created by manager
        { assignedTo: req.user._id }   // assignments assigned to themselves (manager)
      ];
    } else if (req.user.role === 'sales') {
      // Sales sees only leads assigned to them
      filter.assignedTo = req.user._id;
    }
    // Admin sees all, so no additional filter

    const assignments = await LeadAssignment.find(filter)
      .populate('lead', 'firstName lastName email phone status')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate an assignment (soft delete)
 * @route   PUT /api/assignments/:id/deactivate
 * @access  Admin / Manager
 */
export const deactivateAssignment = async (req, res, next) => {
  try {
    const assignment = await LeadAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    // Role-based restriction
    if (req.user.role === 'manager' && assignment.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Manager cannot deactivate assignments created by others' });
    }

    // Prevent redundant deactivation
    if (!assignment.isActive) {
      return res.status(400).json({ success: false, message: 'Assignment is already deactivated' });
    }
    
    assignment.isActive = false;
    await assignment.save();

    res.status(200).json({ success: true, message: 'Assignment deactivated', data: assignment });
  } catch (error) {
    next(error);
  }
};