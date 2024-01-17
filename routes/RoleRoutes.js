// routes/RoleRoutes.js
const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const User = require('../models/User_Management');
// const verifyAdmin = require('../middleware/Middleware');
const jwt = require('jsonwebtoken');
const multer = require('multer');


// Multer setup for handling form data
// Multer setup for handling form data
const upload = multer();
// Helper function to generate a unique role ID
function generateUniqueRid() {
    return `RID${Date.now()}`;
}

// Create a new role
router.post('/create', upload.none(),async (req, res) => {
    try {
        // Generate unique rid
        const rid = generateUniqueRid();
console.log(req.body);
        // Create a new role with the generated ID and provided data
        const newRole = new Role({ ...req.body, rid });
        await newRole.save();

        res.status(201).json({ message: 'Role created successfully', role: newRole });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all roles
router.get('/list', async (req, res) => {
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
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        console.error('Error getting roles:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get role by rid
router.get('/:rid', async (req, res) => {
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
        const role = await Role.findOne({ rid: req.params.rid });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    } catch (error) {
        console.error('Error getting role by rid:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update role by rid
router.put('/:rid', upload.none(),async (req, res) => {
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
        const updatedRole = await Role.findOneAndUpdate(
            { rid: req.params.rid },
            req.body,
            { new: true }
        );
        if (!updatedRole) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
    } catch (error) {
        console.error('Error updating role by rid:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete role by rid
router.delete('/:rid', async (req, res) => {
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
        const deletedRole = await Role.findOneAndDelete({ rid: req.params.rid });
        if (!deletedRole) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json({ message: 'Role deleted successfully', role: deletedRole });
    } catch (error) {
        console.error('Error deleting role by rid:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/updateDept/:uid', async (req, res) => {
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
        const { uid } = req.params;
        const { dept_id } = req.body;

        // Find the user by uid
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's dept_id
        user.dept_id = dept_id;

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'User dept_id updated successfully', user });
    } catch (error) {
        console.error('Error updating user dept_id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
