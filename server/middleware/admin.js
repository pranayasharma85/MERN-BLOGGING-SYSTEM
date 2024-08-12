const jwt = require('jsonwebtoken'); // Import jwt

const adminMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1]; // Extract token from header
        if (!token) {
            return res.status(401).json({ message: 'Token missing or malformed' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Verify token

        if (!decodedToken.isAdmin) { // Check if the user is an admin
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        req.user = decodedToken; // Attach decoded token to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error in adminMiddleware:', error.message);
        return res.status(500).json({ message: 'Server error in adminMiddleware: ' + error.message });
    }
};

module.exports = adminMiddleware; // Export the middleware for use in routes
