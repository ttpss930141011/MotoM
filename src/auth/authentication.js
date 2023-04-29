function authentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    // console.log('Authentication failed', req.isAuthenticated());
    res.redirect('/login');
  }
}

module.exports = authentication;
