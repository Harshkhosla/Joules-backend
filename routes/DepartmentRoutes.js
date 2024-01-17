// routes/DepartmentRoutes.js
const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const path = require('path');
// const router = express.Router();
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

const multer = require('multer');

// Configure multer storage
const uploadDirectory = '/var/www/html/tss_files/Department';
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
// Helper function to generate a unique department ID
function generateUniqueDeptId() {
    return `DEPT${Date.now()}`;
}

// Create a new department
router.post('/create', upload.single('department_photo'), async (req, res) => {
    try {
        // Generate unique dept_id
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
        const dept_id = generateUniqueDeptId();
        const uniqueFileName = req.file.filename;
      
        // Create the URL using the filename
        const url = `http://64.227.186.165/tss_files/Department/${uniqueFileName}`;
        
        
        //   }
        // Create a new department with the generated ID and provided data
        const newDepartment = new Department({
            ...req.body,
            dept_id,
            department_photo: req.file.buffer, // Save the image as a buffer
            department_photo1:url, // Save the image as a buffer
        });
        await newDepartment.save();

        res.status(201).json({ message: 'Department created successfully', department: newDepartment });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all departments
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
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error getting departments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get department by dept_id
router.get('/:dept_id', async (req, res) => {
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
        const department = await Department.findOne({ dept_id: req.params.dept_id });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        console.error('Error getting department by dept_id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update department by dept_id
router.put('/:dept_id', upload.single('department_photo'), async (req, res) => {
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
        const updatedDepartment = await Department.findOneAndUpdate(
            { dept_id: req.params.dept_id },
            {
                ...req.body,
                department_photo: req.file ? req.file.buffer : undefined, // Update image if provided
            },
            { new: true }
        );
        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json({ message: 'Department updated successfully', department: updatedDepartment });
    } catch (error) {
        console.error('Error updating department by dept_id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Delete department by dept_id
router.delete('/:dept_id', async (req, res) => {
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
        const deletedDepartment = await Department.findOneAndDelete({ dept_id: req.params.dept_id });
        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json({ message: 'Department deleted successfully', department: deletedDepartment });
    } catch (error) {
        console.error('Error deleting department by dept_id:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
