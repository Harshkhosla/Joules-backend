const express = require('express');
const router = express.Router();
const multer = require('multer');
const Banner = require('../models/banner');
const path = require('path');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// const uploadDirectory = 'uploads'; // Change the upload directory as needed
const uploadDirectory = '/var/www/html/tss_files/banner'; // Change the upload directory as needed


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



function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9); // You might want to use a more robust method in a production environment
}

router.post('/banners', upload.single('banner_image'), async (req, res) => {
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
    const { banner_title, sub_title ,Butt_title} = req.body;
    // const buffer = req.file.buffer;
    req.body.image=req.file && req.file.filename ?req.file.filename:null
    if(!req.body.image){
        delete req.body.image
    }
    const uniqueFileName1 = req.file.filename;
    console.log(uniqueFileName1);
    // console.log();

    const url = `http://64.227.186.165/tss_files/banner/${req.file.filename}`;
    const banner = new Banner({
      banner_id: generateUniqueId(), // You need to implement this function
      banner_image: {  url: url }, // Set the path accordingly
      banner_title,
      Butt_title,
      sub_title,
    });

    await banner.save();
    res.status(201).send(banner);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});



// Read all banners
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
    const banners = await Banner.find();
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error('Error retrieving banners:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Read a specific banner by ID
router.get('/:id', async (req, res) => {
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
    const banner = await Banner.findOne({ banner_id: req.params.id });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error('Error retrieving banner:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Update a banner by ID
// Update a banner by ID



router.patch('/:id', upload.single('banner_image'), async (req, res) => {
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
    const { banner_title, sub_title, Butt_title } = req.body;

    // Check if a new image is provided
    console.log(req.file);
    const banner_image = req.file
      ? {
          url: `http://64.227.186.165/tss_files/banner/${req.file.filename}`,
        }
        : undefined;
    // console.log(`http://64.227.186.165/tss_files/banner/${req.file.originalname}`);

    // Find the existing banner data
    const existingBanner = await Banner.findOne({ banner_id: req.params.id });

    // Update only the banner fields that are present in the request
    const updatedBanner = await Banner.findOneAndUpdate(
      { banner_id: req.params.id },
      {
        ...(banner_title && { banner_title }),
        ...(sub_title && { sub_title }),
        ...(Butt_title && { Butt_title }),
        ...(banner_image && { banner_image }),
      },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, banner: updatedBanner });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



// Delete a banner by ID
router.delete('/:id', async (req, res) => {
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
    const deletedBanner = await Banner.findOneAndDelete({banner_id: req.params.id});
    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
