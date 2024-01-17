// routes/User_ManagementRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");
// const bcrypt = require('bcrypt');
const excel = require('exceljs');
const saltRounds = 10;
const UserManagement = require('../models/User_Management');



// const uploadDirectory = "uploads"; // Change the upload directory as needed
const uploadDirectory = '/var/www/html/tss_files/home'; // Change the upload directory as needed

async function convertToExcelFormat(userManagementData) {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('User Management');

    // Add headers
    worksheet.addRow(['Username', 'Email', 'Role', 'Status', 'Contact', 'Department', 'Suspended']);
    
    // Add data
    userManagementData.forEach(user => {
        worksheet.addRow([
            user.uname,
            user.email,
            user.role,
            user.status,
            user.contact,
            user.department,
            user.suspended ? 'Yes' : 'No'
        ]);
    });

    // Save the workbook as a buffer
    return workbook.xlsx.writeBuffer();
}

router.get('/exportUserManagement', async (req, res) => {
    try {
        const userManagementData = await UserManagement.find();
        console.log("Number of users found in User Management:", userManagementData.length);

        if (userManagementData.length === 0) {
            return res.status(404).json({ message: 'No user management data found for export' });
        }

        // Assuming you have a function to convert user management data to Excel
        const excelData = await convertToExcelFormat(userManagementData);

        // Set headers for the Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=userManagement.xlsx');

        // Send the Excel file as a buffer
        res.send(excelData);
    } catch (error) {
        console.error('Error exporting user management data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


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


function generateUniqueId() {
    return `UID${Date.now()}`;
}

function generateUniqueDeptId() {
    return `DEPT${Date.now()}`;
}

// Create a new user
router.post('/create',upload.single("pic_url"), async (req, res) => {
    try {
        // Generate unique uid and dept_id
        const uid = generateUniqueId();
        const dept_id = generateUniqueDeptId();
        // console.log(req.file);
        
        
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(req.body.pass, 10);
        const uniqueFileName = req.file.filename;

        
        
        // Create a new user with the generated IDs, hashed password, and provided data
        const newUser = new UserManagement({ ...req.body, uid, dept_id, pass: hashedPassword });
        if (req.file) {
            newUser.pic_url =`http://64.227.186.165/tss_files/home/${uniqueFileName}`
          }
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all users
router.get('/list', async (req, res) => {
    try {
        const users = await UserManagement.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get user by UID
router.get('/:uid', async (req, res) => {
    try {
        const user = await UserManagement.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user by UID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Updaconst bcryconst bcrypt = require('bcrypt');
router.put('/:uid', upload.single("pic_url"), async (req, res) => {
    try {
        const userdata = req.body;

        // Encrypt the password if it exists
        if (userdata.pass) {
            const hashedPassword = await bcrypt.hash(userdata.pass, saltRounds);
            userdata.pass = hashedPassword;
        }

        if (!req.file) {
            delete userdata.pic_url;
        } else {
            const files = req.file;
            userdata.pic_url = `http://64.227.186.165/tss_files/home/${files.filename}`;
        }

        const updatedUser = await UserManagement.findOneAndUpdate({ uid: req.params.uid }, userdata, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyValue) {
            // Duplicate key error handling
            return res.status(400).json({ message: 'Duplicate key error', duplicateKey: error.keyValue });
        }

        console.error('Error updating user by UID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Delete user by UID
router.delete('/:uid', async (req, res) => {
    try {
        const deletedUser = await UserManagement.findOneAndDelete({ uid: req.params.uid });
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        console.error('Error deleting user by UID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.put('/suspend/:uid', async (req, res) => {
    try {
        const { suspend_reason } = req.body;

        // Check if suspend_reason is provided
        if (!suspend_reason) {
            return res.status(400).json({ message: 'suspend_reason is required' });
        }

        // Find the user by UID and update the suspend_reason and set suspended to true
        const suspendedUser = await UserManagement.findOneAndUpdate(
            { uid: req.params.uid },
            { $set: { suspend_reason, suspended: true } },
            { new: true }
        );

        // Check if the user was found
        if (!suspendedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User suspended successfully', user: suspendedUser });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/unsuspend/:uid', async (req, res) => {
    try {
        // Find the user by UID and remove the suspend_reason and set suspended to false
        const unsuspendedUser = await UserManagement.findOneAndUpdate(
            { uid: req.params.uid },
            { $unset: { suspend_reason: '' }, $set: { suspended: false } },
            { new: true }
        );

        // Check if the user was found
        if (!unsuspendedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User unsuspended successfully', user: unsuspendedUser });
    } catch (error) {
        console.error('Error unsuspending user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
