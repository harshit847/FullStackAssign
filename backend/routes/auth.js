const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      leads: [],   
      tasks: [],
      users: [],
    });

    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});


router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.leads || user.leads.length === 0) {
      user.leads = ["Lead - Demo"];
    }
    if (!user.tasks || user.tasks.length === 0) {
      user.tasks = ["Task - Demo"];
    }
    if (!user.users || user.users.length === 0) {
      user.users = ["User - Demo"];
    }

    await user.save();

    res.status(200).json({
      leads: user.leads,
      tasks: user.tasks,
      users: user.users,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/add-lead", authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) return res.status(400).json({ msg: "Value required" });

    const user = await User.findById(req.user.id);

    user.leads = user.leads || [];
    user.leads.push(value);

    await user.save();

    res.json(user.leads);

  } catch (error) {
    res.status(500).json({ msg: "Error adding lead" });
  }
});


router.post("/add-task", authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) return res.status(400).json({ msg: "Value required" });

    const user = await User.findById(req.user.id);

    user.tasks = user.tasks || [];
    user.tasks.push(value);

    await user.save();

    res.json(user.tasks);

  } catch (error) {
    res.status(500).json({ msg: "Error adding task" });
  }
});


router.post("/add-user", authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) return res.status(400).json({ msg: "Value required" });

    const user = await User.findById(req.user.id);

    user.users = user.users || [];
    user.users.push(value);

    await user.save();

    res.json(user.users);

  } catch (error) {
    res.status(500).json({ msg: "Error adding user" });
  }
});


module.exports = router;