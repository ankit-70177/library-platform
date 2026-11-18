const allowedRoles = ['customer', 'owner', 'admin']

export const authorizeRole = (...roles) => {
  // Prevent invalid roles from being used in route protection
  const invalidRoles = roles.filter((role) => !allowedRoles.includes(role))

  if (invalidRoles.length > 0) {
    throw new Error(`Invalid role(s): ${invalidRoles.join(', ')}`)
  }

  return (req, res, next) => {
    // authenticateUser must run before this middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      })
    }

    next()
  }
}