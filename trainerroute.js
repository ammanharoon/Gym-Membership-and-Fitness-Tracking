const express = require("express");
const { registerTrainer, loginTrainer } = require("../controllers/trainerAuth");
const router = express.Router();

router.post("/registertrainer", registerTrainer);
router.post("/logintrainer", loginTrainer);

module.exports = router;
