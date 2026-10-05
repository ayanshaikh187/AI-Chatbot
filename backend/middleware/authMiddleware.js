const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// AUTH MIDDLEWARE
// ===============================
const protect = async (req, res, next) => {
  try {
    // Authorization header check
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    // "Bearer TOKEN" se sirf TOKEN nikalna
    const token = authHeader.split(" ")[1];

    // JWT verify
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Token ke andar userId se user find karna
    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // User ko request ke andar attach karna
    req.user = user;

    // Next middleware/controller par jana
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = protect;