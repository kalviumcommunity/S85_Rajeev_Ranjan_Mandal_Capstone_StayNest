const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Changed from userId to id to match JWT strategy
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
