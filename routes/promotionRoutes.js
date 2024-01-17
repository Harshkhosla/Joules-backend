const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const Promotion = require('../models/promotion');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
// Create
router.post('/',upload.none(), async (req, res) => {
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
      permission.catg === 'User' && permission.create
      );
      
    if (!canReadProducts) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const promotionData = req.body;

    // Generate unique promo_id and promotion_code
    const promo_id = uuid.v4();
    const promotion_code = uuid.v4().substring(0, 8).toUpperCase(); // Using first 8 characters of the UUID

    promotionData.promo_id = promo_id;
    promotionData.promotion_code = promotion_code;

    const newPromotion = new Promotion(promotionData);
    await newPromotion.save();

    res.status(201).json({ message: 'Promotion created successfully', promo_id });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read all promotions
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
    const promotions = await Promotion.find();
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read single promotion by promo_id
router.get('/:promo_id', async (req, res) => {
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
    const promotion = await Promotion.findOne({ promo_id: req.params.promo_id });
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update
router.put('/:promo_id', upload.none(),async (req, res) => {
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
    const updatedPromotion = await Promotion.findOneAndUpdate(
      { promo_id: req.params.promo_id },
      req.body,
      { new: true }
    );
    if (!updatedPromotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(200).json({ message: 'Promotion updated successfully', updatedPromotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete
router.delete('/:promo_id', async (req, res) => {
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
      permission.catg === 'User' && permission.delete
      );
      
    if (!canReadProducts) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const deletedPromotion = await Promotion.findOneAndDelete({ promo_id: req.params.promo_id });
    if (!deletedPromotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(200).json({ message: 'Promotion deleted successfully', deletedPromotion });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
