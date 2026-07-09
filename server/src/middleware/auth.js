// Optional authentication middleware
// If user is authenticated, sets req.userId
// Does not block unauthenticated requests (for backwards compatibility)
export function optionalAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.userId = userId;
  }
  next();
}

// Required authentication middleware
export function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = userId;
  next();
}
