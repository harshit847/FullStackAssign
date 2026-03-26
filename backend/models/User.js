const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  leads: [String],
  tasks: [String],
  users: [String], 
});

module.exports = mongoose.model("User", userSchema);