const Job = require("../models/Job");
const parseValidationErr = require("../util/parseValidationErr");

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id }).sort("company");
  res.render("jobs", { jobs });
};

const showNewForm = async (req, res) => {
  res.render("job", { job: null });
};

const createJob = async (req, res) => {
  try {
    await Job.create({
      company: req.body.company,
      position: req.body.position,
      status: req.body.status,
      createdBy: req.user._id,
    });

    req.flash("info", "Job created successfully.");
    res.redirect("/jobs");
  } catch (error) {
    if (error.name === "ValidationError") {
      req.flash("errors", parseValidationErr(error));
      return res.render("job", {
        job: {
          company: req.body.company,
          position: req.body.position,
          status: req.body.status,
        },
      });
    }

    throw error;
  }
};

const showEditForm = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!job) {
    req.flash("errors", "Job not found.");
    return res.redirect("/jobs");
  }

  res.render("job", { job });
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!job) {
      req.flash("errors", "Job not found.");
      return res.redirect("/jobs");
    }

    job.company = req.body.company;
    job.position = req.body.position;
    job.status = req.body.status;

    await job.save();

    req.flash("info", "Job updated successfully.");
    res.redirect("/jobs");
  } catch (error) {
    if (error.name === "ValidationError") {
      req.flash("errors", parseValidationErr(error));
      return res.render("job", {
        job: {
          _id: req.params.id,
          company: req.body.company,
          position: req.body.position,
          status: req.body.status,
        },
      });
    }

    throw error;
  }
};

const deleteJob = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!job) {
    req.flash("errors", "Job not found.");
    return res.redirect("/jobs");
  }

  await Job.deleteOne({ _id: req.params.id, createdBy: req.user._id });

  req.flash("info", "Job deleted successfully.");
  res.redirect("/jobs");
};

module.exports = {
  getAllJobs,
  showNewForm,
  createJob,
  showEditForm,
  updateJob,
  deleteJob,
};