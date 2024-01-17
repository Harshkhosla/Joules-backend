const express = require('express');
const multer = require('multer');
const Contact = require('../models/contact');
const router = express.Router();
const path = require('path');
const uploadDirectory = '/var/www/html/tss_files/seo';
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
// const uploadDirectory = 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = generateUniqueRid() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});

function generateUniqueRid() {
  return `RID${Date.now()}`;
}

const upload = multer({ storage: storage });

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
      permission.catg === 'User' && permission.read
      );
      
    if (!canReadProducts) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const contactData = await Contact.findOne();
    res.status(200).json(contactData);
  } catch (error) {
    console.error('Error fetching contact data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update
router.put('/', upload.single('SEOArea.images'), async (req, res) => {
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
    const updatedData = req.body;

    // Check if a file was uploaded
    if (req.file) {
      const uniqueFileName = req.file.filename;

      // Create the URL using the filename
      const url = `http://64.227.186.165/tss_files/seo/${uniqueFileName}`;

      // Update the updatedData with the URL and buffer
      updatedData['SEOArea.images1'] = url;
    }

    const existingContact = await Contact.findOne();

    if (!existingContact) {
      // If no contact data exists, create a new one
      const newContact = await Contact.create(updatedData);
      res.status(201).json(newContact);
    } else {
      // Update the existing contact data
      const updatedContact = await Contact.findByIdAndUpdate(existingContact._id, updatedData, { new: true });
      res.status(200).json(updatedContact);
    }
  } catch (error) {
    console.error('Error updating contact data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
