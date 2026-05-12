/**
 * Role-based access control middleware
 * @param  {...String} allowedRoles - roles allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // req.user is set by verifyToken middleware
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: User role not found",
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to perform this action",
        });
      }

      // Role is allowed → continue
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access denied",
      });
    }
  };
};

module.exports = authorizeRoles;
