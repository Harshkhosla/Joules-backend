// routes/looksRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // Assuming you're using multer for handling file uploads

const path = require('path');
const Looks = require('../models/looks');

const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// Multer storage configuration
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
const uploadDirectory = '/var/www/html/tss_files/looks';
// const uploadDirectory = 'uploads';

// Create a new look
router.post('/', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'slider', maxCount: 5 }, // Assuming a maximum of 5 images in the slider
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
        permission.catg === 'Content' && permission.create
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const { title,catalog_id } = req.body;
    console.log(catalog_id);

    // Validate request body
    // if (!title || !req.files['thumbnail'] || !req.files['slider']) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // }

    // Process thumbnail image
    const thumbnailFile = req.files['thumbnail'][0];
    const thumbnailUrl = `http://64.227.186.165/tss_files/looks/${thumbnailFile.filename}`;
console.log(req.files);
    // Process slider images
    const sliderImages = req.files['slider'].map(file => ({
    //   buffer: file.buffer,
      url: `http://64.227.186.165/tss_files/looks/${file.filename}`,
    }));
    // console.log(sliderImages);

    // Create a new Looks document
    const newLook = new Looks({
      thumbnail: {
        // buffer: thumbnailFile.buffer,
        url: thumbnailUrl,
      },
      slider: sliderImages, 
      title: title,
      catalog_id: catalog_id,
    });

    // Save the new Look
    await newLook.save();

    // Send a success response
    res.status(201).json(newLook);
  } catch (error) {
    console.error('Error creating a new Look:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all looks
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
    const allLooks = await Looks.find();
    res.status(200).json(allLooks);
  } catch (error) {
    console.error('Error fetching all Looks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a specific look by ID
router.get('/:catalog_id', async (req, res) => {
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
    console.log(req.params.catalog_id);
    const look = await Looks.find({catalog_id:req.params.catalog_id});
    console.log(look);
    if (!look) {
      return res.status(404).json({ message: 'Look not found' });
    }
    res.status(200).json(look);
  } catch (error) {
    console.error('Error fetching Look by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
    // Update a look by ID
    router.put('/:catalog_id', upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'slider', maxCount: 5 },
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
          const { title } = req.body;
      
          // Validate request body
          if (!title) {
            return res.status(400).json({ message: 'Missing required fields' });
          }
      
          // Find the Look by Catalog ID
          const look = await Looks.findById( req.params.catalog_id );
      
          if (!look) {
            return res.status(404).json({ message: 'Look not found' });
          }
      
          // Update thumbnail image if provided
          if (req.files['thumbnail']) {
            const thumbnailFile = req.files['thumbnail'][0];
            look.thumbnail = {
            //   buffer: thumbnailFile.buffer,
              url: `http://64.227.186.165/tss_files/looks/${thumbnailFile.filename}`,
            };
          }
      
          // Update slider images if provided
          if (req.files['slider']) {
            const sliderImages = req.files['slider'].map(file => ({
            //   buffer: file.buffer,
              url: `http://64.227.186.165/tss_files/looks/${file.filename}`,
            }));
            look.slider = sliderImages;
          }
      
          // Update title
          look.title = title;
      
          // Save the updated Look
          await look.save();
      
          // Send a success response
          res.status(200).json(look);
        } catch (error) {
          console.error('Error updating Look by Catalog ID:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      });
      

// Delete a look by ID
router.delete('/:catalog_id', async (req, res) => {
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
        permission.catg === 'Content' && permission.delete
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
        const deletedLook = await Looks.findByIdAndDelete({_id:req.params.catalog_id});
  
      if (!deletedLook) {
        return res.status(404).json({ message: 'Look not found' });
      }
  
      res.status(200).json({ message: 'Look deleted successfully', deletedLook });
    } catch (error) {
      console.error('Error deleting Look by ID:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
module.exports = router;
