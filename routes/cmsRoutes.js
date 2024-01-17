// routes/cmsRoutes.js
const express = require('express');
const router = express.Router();
const CMS = require('../models/CMSSchema');
const multer = require('multer');
const upload = multer();
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

// Get CMS content
router.get('/', async (req, res) => {
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
        permission.catg === 'Content' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    // Fetch the CMS content from the database
    const cmsContent = await CMS.findOne();

    if (cmsContent) {
      res.status(200).json({ content: cmsContent.content });
    } else {
      res.status(404).json({ message: 'CMS content not found' });
    }
  } catch (error) {
    console.error('Error getting CMS content:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update CMS content
router.post('/', async (req, res) => {
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
    const { content } = req.body;

    // Check if CMS content exists in the database
    let cmsContent = await CMS.findOne();

    if (!cmsContent) {
      // If CMS content doesn't exist, create a new entry
      cmsContent = new CMS({ content });
    } else {
      // If CMS content exists, update the existing entry
      cmsContent.content = content;
    }

    // Save the updated or new CMS content to the database
    await cmsContent.save();

    res.status(200).json({ message: 'CMS content updated successfully' });
  } catch (error) {
    console.error('Error updating CMS content:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
