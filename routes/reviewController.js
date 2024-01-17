const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/product');
const path = require("path");
const multer = require('multer');

const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

// const uploadDirectory = "uploads"; // Change the upload directory as needed
const uploadDirectory = '/var/www/html/tss_files/home'; // Change the upload directory as needed



function generateUniqueRid() {
    return `RID${Date.now()}`;
  }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    console.log("multer", file);

    const uniqueFileName =
      generateUniqueRid() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});



const upload = multer({ storage: storage });
router.post('/reviews', upload.single("review_photo"), async (req, res) => {
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
          permission.catg === 'Inventory' && permission.create
      );

      if (!canReadProducts) {
          return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
       const { mid, pid, product_name, rating, review, username } = req.body;

    const uniqueFileName = req.file.filename;
    const product1 = await Product.findOne({ pid: req.body.pid });
    const Review1 = await Review.find({ pid: req.body.pid });
    console.log(Review1.length);
    const url = `http://64.227.186.165/tss_files/home/${uniqueFileName}`;

    // Update product rating
    if(Review1.length<1){
      product1.rating = Number(Number(rating) + Number(product1.rating));
    }else{

      console.log(  product1.rating );
      product1.rating = Number(Number(rating) + Number(product1.rating));
      console.log(  product1.rating );
      product1.average_rating = product1.rating / 2;
      console.log(product1.average_rating);
      product1.rating=product1.average_rating;
    }

    // Save the updated product data
    await product1.save();

    const newReview = await Review.create({
      mid,
      pid,
      product_name,
      rating,
      review,
      review_photo: url,
      rid: generateUniqueRid(),
      username
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Read operation - GET all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
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
        permission.catg === 'Inventory' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read operation - GET a specific review by ID
router.get('/reviews/:mid', async (req, res) => {
    try {
      const review = await Review.findOne({ mid: req.params.mid });
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
        permission.catg === 'Inventory' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(review);
    } catch (error) {
      console.error('Error getting review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Update operation - PUT
router.put('/reviews/:mid', upload.none(),async (req, res) => {
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
        permission.catg === 'Inventory' && permission.update
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
      const updatedReview = await Review.findOneAndUpdate({ mid: req.params.mid }, req.body, { new: true });

      if (!updatedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete operation - DELETE
  router.delete('/reviews/:mid', async (req, res) => {
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
        permission.catg === 'Inventory' && permission.delete
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
      const deletedReview = await Review.findOneAndDelete({ mid: req.params.mid });
      if (!deletedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(deletedReview);
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

module.exports = router;
