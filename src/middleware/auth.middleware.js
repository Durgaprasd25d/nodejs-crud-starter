import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
  try {

    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is required.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
console.log(token)
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    console.log(decoded)

    // Attach decoded user information to request
    req.user = decoded;

    // Move to next middleware or controller
    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });

  }
};

export default authenticateUser;