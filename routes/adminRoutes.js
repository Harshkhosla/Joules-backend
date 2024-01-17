// adminRoutes.js
const express = require('express');
const router = express.Router();
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const multer = require('multer');
const upload = multer(); // initialize multer
const User = require('../models/User');
const UserManagement = require('../models/User_Management');
const jwt = require('jsonwebtoken');

// router.post('/login', upload.none(), async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find the admin by email
//         let admin = await Admin.findOne({ email });

//         // If admin does not exist, create a new admin
//         if (!admin) {
//             console.log('Admin not found, creating a new admin...');

//             // Use a default password for the new admin (change in production)
//             const defaultPassword = 'admin@123';
//             const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//             // Create a new admin with the provided email and default password
//             admin = new Admin({
//                 email,
//                 password: hashedPassword,
//                 uid: generateUniqueUid(),
//             });

//             // Save the new admin to the database
//             await admin.save();

//             console.log('New admin created:', admin);
//         }

//         // Compare the entered password with the hashed password in the database
//         // const isPasswordValid = await bcrypt.compare(password, admin.password);

//         // if (!isPasswordValid) {
//         //     console.log('Invalid password');
//         //     return res.status(401).json({ message: 'Invalid email or password' });
//         // }

//         // Generate an authentication token
//         const authToken = jwt.sign({ adminId: admin._id }, 'your-secret-key', { expiresIn: '1h' });

//         console.log('Admin login successful:', admin);
//         res.status(200).json({ message: 'Admin login successful', authToken, uid: admin.uid });
//     } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
// // Function to generate a unique UID (you can customize this based on your requirements)
// function generateUniqueUid() {
//     // Logic to generate a unique UID (for example, using a combination of timestamp and a random number)
//     const timestamp = new Date().getTime();
//     const randomNum = Math.floor(Math.random() * 1000);
//     return `UID${timestamp}${randomNum}`;
// }
// // Helper function to generate a unique UID (you can customize this based on your requirements)
// // function generateUniqueUid() {
// //     return `UID${Date.now()}`;
// // }


router.post('/sendMessage/:mid', async (req, res) => {
    try {
        const { mid } = req.params;
        const { msg } = req.body;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new message object
        const newMessage = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            msg_id: generateMessageId(),
            msg,
            readed: false,
            sender_uid: 'admin_uid', // You can replace this with the actual admin's UID
            sender_uname: 'Admin',   // You can replace this with the actual admin's username
        };

        // Add the new message to the user's messages array
        user.data.messages.push(newMessage);

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// const bcrypt = require('bcrypt');

router.post('/login', upload.none(), async (req, res) => {
    try {
        const { uname, password } = req.body;
        // console.log(req.body);
        
        console.log('Checking UserManagement for login...');
        let user = await UserManagement.findOne({ uname });
        if(user.suspended){
            return res.status(401).json({ message: 'Member suspended' });
        }

        // If user does not exist, return authentication failure
        if (!user) {
            console.log('User not found in UserManagement');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the entered password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.pass);

        // If the password is not valid, return authentication failure
        if (!isPasswordValid) {
            console.log('Invalid password for UserManagement user');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate an authentication token for the user in UserManagement
        const userAuthToken = jwt.sign(
            { userId: user._id, uid: user.uid, role: user.role },
            'your-secret-key'
        );

        console.log('UserManagement user login successful:', user);
        return res.status(200).json({ message: 'User login successful', authToken: userAuthToken, uid: user.uid });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Helper function to generate a unique UID (you can customize this based on your requirements)
function generateUniqueUid() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `UID${timestamp}${randomNum}`;
}

// module.exports = router;


// Helper function to generate a unique message id
function generateMessageId() {
    return crypto.randomBytes(16).toString('hex');
}
module.exports = router;
