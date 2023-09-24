

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated
      res.status(401).json({ message: 'Unauthorized. Please log in to access this resource.' });
    }
  };

  // Admin username (change to your admin username)
const adminUsername = 'manish';

module.exports = { isAuthenticated, adminUsername };