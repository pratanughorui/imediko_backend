const practiceModel = require("../models/practice.model");

exports.createPractice = async (req, res) => {
  try {
    const {
      doctor_id,
      practice_name,
      practice_type,
      location,
      consultation_fee,
      slot_duration,
      status,
    } = req.body;

    // validation
    if (
      !doctor_id ||
      !practice_name ||
      !practice_type ||
      !location ||
      consultation_fee === undefined ||
      !slot_duration
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // create practice
    const practice = await practiceModel.create({
      doctor_id,
      practice_name,
      practice_type,
      location,
      consultation_fee,
      slot_duration,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Practice created successfully",
      data: practice,
    });
  } catch (error) {
    console.error("Create Practice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getPracticesByDoctorId = async (req, res) => {
  try {
    const { doctor_id } = req.params;

    // validation
    if (!doctor_id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // fetch practices
    const practices = await practiceModel
      .find({
        doctor_id,
      })
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      total: practices.length,
      data: practices,
    });
  } catch (error) {
    console.error("Get Practices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.deletePractice = async (req, res) => {
  try {
    const { practice_id } = req.params;

    // validation
    if (!practice_id) {
      return res.status(400).json({
        success: false,
        message: "Practice ID is required",
      });
    }

    // check practice exists
    const practice = await practiceModel.findById(practice_id);

    if (!practice) {
      return res.status(404).json({
        success: false,
        message: "Practice not found",
      });
    }

    // delete practice
    await practiceModel.findByIdAndDelete(practice_id);

    return res.status(200).json({
      success: true,
      message: "Practice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Practice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updatePractice = async (req, res) => {
  try {
    const { practice_id } = req.params;

    const {
      practice_name,
      practice_type,
      location,
      consultation_fee,
      slot_duration,
      status,
    } = req.body;

    // validation
    if (!practice_id) {
      return res.status(400).json({
        success: false,
        message: "Practice ID is required",
      });
    }

    // check practice exists
    const existingPractice = await practiceModel.findById(practice_id);

    if (!existingPractice) {
      return res.status(404).json({
        success: false,
        message: "Practice not found",
      });
    }

    // update object
    const updatedData = {};

    if (practice_name !== undefined) updatedData.practice_name = practice_name;

    if (practice_type !== undefined) updatedData.practice_type = practice_type;

    if (location !== undefined) updatedData.location = location;

    if (consultation_fee !== undefined)
      updatedData.consultation_fee = consultation_fee;

    if (slot_duration !== undefined) updatedData.slot_duration = slot_duration;

    if (status !== undefined) updatedData.status = status;

    // update practice
    const updatedPractice = await practiceModel.findByIdAndUpdate(
      practice_id,
      updatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Practice updated successfully",
      data: updatedPractice,
    });
  } catch (error) {
    console.error("Update Practice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getPracticeById = async (req, res) => {
  try {
    const { practice_id } = req.params;

    // validation
    if (!practice_id) {
      return res.status(400).json({
        success: false,
        message: "Practice ID is required",
      });
    }

    // fetch practice
    const practice = await practiceModel.findById(practice_id);

    // check practice exists
    if (!practice) {
      return res.status(404).json({
        success: false,
        message: "Practice not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: practice,
    });
  } catch (error) {
    console.error("Get Practice By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
