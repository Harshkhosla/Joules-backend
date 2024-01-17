// routes/transactions.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const multer = require('multer');
const upload = multer();
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

function generateUniqueMid() {
    // Logic to generate a unique mid (for example, using a combination of timestamp and a random number)
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `TID${timestamp}${randomNum}`;
}


// Create a new transaction
router.post('/', upload.none(), async (req, res) => {
    try {
      // Validate request body
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
      const { status, amt, time, date, oid, mid } = req.body;
  
      if (!status || !amt || !time || !date || !oid || !mid  ) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Create a new transaction
      const newTransaction = new Transaction({
        status,
        amt,
        time,
        date,
        oid,
        mid,
        transaction_id:generateUniqueMid(),
      });
  
      // Save the new transaction
      await newTransaction.save();
  
      // Send a success response
      res.status(201).json(newTransaction);
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating a new transaction:', error);
  
      // Send an internal server error response
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Get all transactions
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
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// // Get a specific transaction by transaction_id
// router.get('/:transaction_id', async (req, res) => {
//   try {
//     const transaction = await Transaction.findOne({ transaction_id: req.params.transaction_id });
//     if (transaction) {
//       res.json(transaction);
//     } else {
//       res.status(404).json({ message: 'Transaction not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Get a specific transaction by transaction_id
router.get('/:mid', async (req, res) => {
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
    const transaction = await Transaction.find({ mid: req.params.mid });
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ message: 'reward not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a transaction by transaction_id
router.put('/:transaction_id', upload.none(),async (req, res) => {
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
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transaction_id: req.params.transaction_id },
      req.body,
      { new: true }
    );
    if (updatedTransaction) {
      res.json(updatedTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a transaction by transaction_id
router.delete('/:transaction_id', async (req, res) => {
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
    const deletedTransaction = await Transaction.findOneAndDelete({ transaction_id: req.params.transaction_id });
    if (deletedTransaction) {
      res.json(deletedTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
