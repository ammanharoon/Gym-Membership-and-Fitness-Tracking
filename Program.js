const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true }
});

module.exports = mongoose.model("Program", ProgramSchema);
