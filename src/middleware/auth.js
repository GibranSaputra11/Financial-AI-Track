const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ error: 'Unauthorized', redirect: '/login' });
    }
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  req.userId = req.session.userId;
  req.username = req.session.username || 'User';
  next();
};

const optionalAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.username = req.session.username;
  }
  next();
};

const redirectIfAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  redirectIfAuth,
};