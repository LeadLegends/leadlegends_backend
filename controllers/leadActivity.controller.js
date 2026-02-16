import LeadActivity from '../models/leadActivity.model.js';
import Lead from '../models/lead.model.js';

/**
 * @desc    Create a new activity for a lead
 * @route   POST /api/activities
 * @access  Admin / Manager / Sales
 */
export const createActivity = async (req, res, next) => {
  try {
    const { lead: leadId, activityType, description, newStatus, nextFollowUpAt } = req.body;

    // Validate lead
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // If activity is status_change, capture previous status
    let previousStatus;
    if (activityType === 'status_change') {
      previousStatus = lead.status;
      lead.status = newStatus; // update lead status
      await lead.save();
    }

    // Create the activity
    const activity = await LeadActivity.create({
      lead: leadId,
      activityType,
      description,
      performedBy: req.user._id,
      previousStatus,
      newStatus,
      nextFollowUpAt,
    });

    res.status(201).json({ success: true, message: 'Activity recorded', data: activity });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all activities for a lead
 * @route   GET /api/activities/:leadId
 * @access  Admin / Manager / Sales
 */
/**
 * @desc    Get all activities for a lead (with optional filters)
 * @route   GET /api/activities/:leadId
 * @access  Admin / Manager / Sales
 */
export const getActivitiesByLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { type, upcomingFollowUps } = req.query;

    // Validate lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Build filter
    const filter = { lead: leadId };

    // Filter by activity type if provided
    if (type) {
      // Allow multiple types comma-separated
      const typesArray = type.split(','); 
      filter.activityType = { $in: typesArray };
    }

    // Filter for upcoming follow-ups
    if (upcomingFollowUps === 'true') {
      filter.nextFollowUpAt = { $gte: new Date() }; // only future follow-ups
    }

    // Get activities
    const activities = await LeadActivity.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
};