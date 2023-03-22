module.exports = (roleCode) => (req, res, next) => {
  req.currentRoleCode = roleCode;
  next();
};
