const express = require('express');
const router = express.Router();
const multer = require('multer');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
// Multer setup for handling form data
// Multer setup for handling form data
const upload = multer();

// Helper function to generate a unique sid
function generateUniqueSid() {
    return `SID${Date.now()}`;
}
router.get('/settings', async (req, res) => {
    try {
        const authToken = req.headers.authorization || req.headers.Authorization;
    console.log(authToken);
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'User' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        res.status(200).json(settings);
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update settings
// Update settings or create a new one if it doesn't exist
router.put('/settings', upload.none(), async (req, res) => {
    try {
        const authToken = req.headers.authorization || req.headers.Authorization;
    console.log(authToken);
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    }
    // Decode the authentication token
    const decodedToken = jwt.verify(authToken, 'your-secret-key');
    // Check if the decoded token has the necessary fields (userId, uid, role)
    if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    }
    // Get the user's role and permissions from the database based on the decoded token
    const userRole = decodedToken.role;
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'User' && permission.update
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
        // Extract fields from the request body
        const {
            site_name,
            portal_url,
            admin_email,
            support_mail,
            primary_color,
            secondary_color,
            background_color,
            smtp_details,
        } = req.body;

        // Find the existing settings document
        let existingSettings = await Settings.findOne();

        // If settings document doesn't exist, create a new one
        if (!existingSettings) {
            const sid = generateUniqueSid(); // Use your unique ID generation logic
            existingSettings = new Settings({
                sid,
                site_name,
                portal_url,
                admin_email,
                support_mail,
                primary_color,
                secondary_color,
                background_color,
                smtp_details,
            });
        } else {
            // Update individual fields
            existingSettings.site_name = site_name || existingSettings.site_name;
            existingSettings.portal_url = portal_url || existingSettings.portal_url;
            existingSettings.admin_email = admin_email || existingSettings.admin_email;
            existingSettings.support_mail = support_mail || existingSettings.support_mail;
            existingSettings.primary_color = primary_color || existingSettings.primary_color;
            existingSettings.secondary_color = secondary_color || existingSettings.secondary_color;
            existingSettings.background_color = background_color || existingSettings.background_color;

            // Update smtp_details fields individually
            if (smtp_details) {
                Object.assign(existingSettings.smtp_details, smtp_details);
            }
        }

        // Save the updated or new settings
        const updatedSettings = await existingSettings.save();

        res.status(200).json(updatedSettings);
    } catch (error) {
        console.error('Error updating or creating settings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
