import Lead from "../models/lead.model.js";

/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Public / Private (depends on source)
 */

export const createLeadInternal = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, company, source, message } =
      req.body;

    // Basic validation
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    // Optional: prevent duplicate leads
    const existingLead = await Lead.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "Lead already exists",
      });
    }

    const lead = await Lead.create({
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      message,
      status: "New", // default status
      createdBy: req.user._id, // assign current logged-in user
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLeadPublic = async (req, res, next) => {
  try {
    const { firstName, lastName, email, company,phone, message } =
      req.body;
    console.log(req.body);

    // Basic validation
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      })
    }

    // Optional: prevent duplicate leads
    const existingLead = await Lead.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "Lead already exists",
      });
    }

    const systemUser = await User.findOne({ email: "system@yourapp.com" });

    const lead = await Lead.create({
      firstName,
      lastName,
      email,
      phone,
      company,
      source: "Website",
      message,
      status: "New", // default status
      createdBy: systemUser._id, // assign system user
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lead
 * @route   PUT /api/leads/:id
 * @access  Private
 */
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (
      req.user.role === "sales" &&
      lead.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Sales cannot update leads they did not create",
        });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lead
 * @route   DELETE /api/leads/:id
 * @access  Private
 */
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leads with filters
 * @route   GET /api/leads
 */
export const getAllLeads = async (req, res, next) => {
  try {
    const { status, source } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;

    if (req.user.role === "sales" ) {
      filter.createdBy = req.user._id;
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};
