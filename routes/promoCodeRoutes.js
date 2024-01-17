const express = require('express');
const PromoCode = require('../models/promoCode');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const path = require('path');

// Multer setup for handling form data
const upload = multer();

// Create or Update (PUT)
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

    // Check if the user has permission to update promo codes in the "Content" category
    const canUpdatePromoCodes = userPermissionsArray.permissions.some(permission =>
      permission.catg === 'Content' && permission.update
    );

    if (!canUpdatePromoCodes) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // Check if there is an existing promo code data
    const existingPromoCode = await PromoCode.findOne();

    // If data exists, update it; otherwise, create a new one
    if (existingPromoCode) {
      const updatedData = req.body;
      const updatedPromoCode = await PromoCode.findByIdAndUpdate(
        existingPromoCode._id,
        updatedData,
        { new: true }
      );
      res.status(200).json({ message: 'Promo code data updated successfully', updatedPromoCode });
    } else {
      const promoCodeData = req.body;
      const newPromoCode = new PromoCode(promoCodeData);
      await newPromoCode.save();
      res.status(201).json({ message: 'Promo code data created successfully', newPromoCode });
    }
  } catch (error) {
    console.error('Error creating/updating promo code data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read (GET)
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

    // Check if the user has permission to read promo codes in the "Content" category
    const canReadPromoCodes = userPermissionsArray.permissions.some(permission =>
      permission.catg === 'Content' && permission.read
    );

    if (!canReadPromoCodes) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // Retrieve the promo code data (assuming only one record is stored)
    const promoCodeData = await PromoCode.findOne();
    res.status(200).json(promoCodeData);
  } catch (error) {
    console.error('Error fetching promo code data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
