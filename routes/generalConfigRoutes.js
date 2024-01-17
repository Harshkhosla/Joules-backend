const express = require('express');
const GeneralConfig = require('../models/generalConfig');

const router = express.Router();
const multer = require('multer');

// Multer setup for handling form data
const upload = multer();

const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const path = require('path');
// Create
router.post('/', upload.none(), async (req, res) => {
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
        permission.catg === 'Content' && permission.create
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const generalConfigData = req.body;
    const newGeneralConfig = new GeneralConfig(generalConfigData);
    await newGeneralConfig.save();

    res.status(201).json({ message: 'General configuration data created successfully' });
  } catch (error) {
    console.error('Error creating general configuration data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read
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
    const generalConfigData = await GeneralConfig.findOne();
    res.status(200).json(generalConfigData);
  } catch (error) {
    console.error('Error fetching general configuration data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update
router.put('/', upload.none(), async (req, res) => {
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
    const updatedGeneralConfig = await GeneralConfig.findOneAndUpdate({}, updatedData, { new: true });

    if (!updatedGeneralConfig) {
      return res.status(404).json({ message: 'General configuration data not found' });
    }

    res.status(200).json({ message: 'General configuration data updated successfully', updatedGeneralConfig });
  } catch (error) {
    console.error('Error updating general configuration data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete (Optional)
router.delete('/', async (req, res) => {
  try {
    const deletedGeneralConfig = await GeneralConfig.findOneAndDelete({});

    if (!deletedGeneralConfig) {
      return res.status(404).json({ message: 'General configuration data not found' });
    }

    res.status(200).json({ message: 'General configuration data deleted successfully', deletedGeneralConfig });
  } catch (error) {
    console.error('Error deleting general configuration data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
