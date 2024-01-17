const express = require('express');
const router = express.Router();
const multer = require('multer');
const About = require('../models/about');
const path = require('path');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const uploadDirectory = '/var/www/html/tss_files/about';
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
        permission.catg === 'Content' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const aboutData = await About.findOne();
    res.status(200).json(aboutData);
  } catch (error) {
    console.error('Error fetching About Us data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update
router.put('/', upload.fields([
  { name: 'AboutBanner.image', maxCount: 1 },
  { name: 'MissionSection.image', maxCount: 1 },
  { name: 'VisionSection.image', maxCount: 1 },
  { name: 'SEOArea.images', maxCount: 1 },
]), async (req, res) => {
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
    const files = req.files;

    req.body.image=req.file && req.file.filename ?req.file.filename:null
    if(!req.body.image){
        delete req.body.image
    }
// console.log(updatedData['SEOArea.images']);
    // Iterate over the fields dynamically
    for (const field of [
      'AboutBanner.image',
      'MissionSection.image',
      'VisionSection.image',
      'SEOArea.images',
    ]) {
      // Check if files[field] exists before accessing it
      if (files[field]) {
        updatedData[field] = `http://64.227.186.165/tss_files/about/${files[field][0].filename}`;
      }
    }

    const existingAbout = await About.findOne();

    // You can now use updatedData to update the document in your database
    if (!existingAbout) {
      // If no about data exists, create a new one
      const newAbout = await About.create(updatedData);
      res.status(201).json(newAbout);
    } else {
      // Update the existing about data
      const updatedAbout = await About.findByIdAndUpdate(existingAbout._id, updatedData, { new: true });
      res.status(200).json(updatedAbout);
    }
  } catch (error) {
    console.error('Error updating about data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
