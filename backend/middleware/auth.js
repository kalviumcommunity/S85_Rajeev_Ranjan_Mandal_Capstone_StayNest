const { verifyToken } = require("../utils/jwtUtils");

const auth = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Add user from payload
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = auth;
