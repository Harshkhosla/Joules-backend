const jwt = require('jsonwebtoken');

// Middleware to verify authentication and admin role
const verifyAdmin = (req, res, next) => {
    const authToken = req.header('Authorization');
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    try {
        const decoded = jwt.verify(authToken, 'your-secret-key');
        req.user = decoded; // Attach the decoded user information to the request object
        // Check if the user has the admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyAdmin;
