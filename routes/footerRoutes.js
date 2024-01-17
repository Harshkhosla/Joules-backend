const express = require('express');
const router = express.Router();
const Footer = require('../models/footer');
const multer = require('multer');
const upload = multer();
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const path = require('path');


// Get the footer
router.get('/', async (req, res) => {
    try {
        const footer = await Footer.findOne();
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
        permission.catg === 'Content' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
        res.status(200).json(footer);
    } catch (error) {
        console.error('Error getting footer:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update the footer
router.put('/',async (req, res) => {
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
        permission.catg === 'Content' && permission.update
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const updatedData = req.body;
        const existingFooter = await Footer.findOne();

        if (!existingFooter) {
            // If no footer exists, create a new one
            const newFooter = await Footer.create(updatedData);
            res.status(201).json(newFooter);
        } else {
            // Update the existing footer
            const updatedFooter = await Footer.findByIdAndUpdate(existingFooter._id, updatedData, { new: true });
            res.status(200).json(updatedFooter);
        }
    } catch (error) {
        console.error('Error updating footer:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
