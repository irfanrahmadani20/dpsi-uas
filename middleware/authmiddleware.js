// middleware/authorizeRole.js
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Assumes the role is added to req.user from JWT verification
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Access denied' });
      }
  
      next();
    };
  };
  
  module.exports = authorizeRole;
  