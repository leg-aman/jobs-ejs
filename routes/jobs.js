const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  showNewForm,
  createJob,
  showEditForm,
  updateJob,
  deleteJob,
} = require("../controllers/jobs");

router.get("/", getAllJobs);
router.get("/new", showNewForm);
router.post("/", createJob);
router.get("/edit/:id", showEditForm);
router.post("/update/:id", updateJob);
router.post("/delete/:id", deleteJob);

module.exports = router;