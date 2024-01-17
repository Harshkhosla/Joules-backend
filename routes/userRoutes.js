const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const multer = require('multer');
const excel = require('exceljs');
// userRoutes.js
const fs = require('fs');
const upload = multer(); // initialize multer





async function convertToExcelFormat(users) {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Add headers
    worksheet.addRow([
        'Email', 'Name', 'Mobile No', 'Verified', 'Payment History',
        'Purchased Items', 'Reward Points', 'Cashback Points', 'Profile Picture URL',
        'Address', 'Bio', 'Birth Date', 'Country', 'First Name',
        'Gender', 'Last Name', 'Phone Number', 'Rating', 'Zipcode',
        'KYC Status', 'Suspend Reason'
    ]);

    // Add data
    users.forEach(user => {
        worksheet.addRow([
            user.email, user.name, user.mobileNo, user.verified, user.payment_history,
            user.purchased_items, user.reward_points, user.cashback_points, user.pic_url,
            user.address, user.bio, user.birth_date, user.country, user.fname,
            user.gender, user.lname, user.phn, user.rating, user.zipcode,
            user.kyc_status, user.suspend_reason
        ]);
    });

    // Save the workbook as a buffer
    return workbook.xlsx.writeBuffer();
}

router.get('/exportUsers', async (req, res) => {
    try {
        const users = await User.find();
        console.log("Number of users found:", users.length);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for export' });
        }

        // Assuming you have a function to convert users data to Excel
        const excelData = await convertToExcelFormat(users);

        // Set headers for the Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

        // Send the Excel file as a buffer
        res.send(excelData);
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post('/register',  upload.none(),async (req, res) => {
    try {
        const { email, name, password, mobileNo } = req.body;

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with verificationToken
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            mobileNo,
            mid: generateUniqueMid(),
            verificationToken,
        });

        // Save the user to the database
        await newUser.save();

        // Send verification email
        await sendVerificationEmail(newUser);

        res.status(201).json({ message: 'User registered successfully', mid: newUser.mid });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Helper function to generate a unique mid (you can customize this based on your requirements)
function generateUniqueMid() {
    // Logic to generate a unique mid (for example, using a combination of timestamp and a random number)
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `MID${timestamp}${randomNum}`;
}

// Helper function to send a verification email
async function sendVerificationEmail(user) {
    const verificationLink = `http://localhost:5000/user/verify?token=${user.verificationToken}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Harshkhosla9945@gmail.com',
            pass: 'smos vryu mccy rhqp',
        },
    });

    const mailOptions = {
        from: 'Harshkhosla9945@gmail.com',
        to: user.email,
        subject: 'Verify Your Email',
        text: `Please click on the following link to verify your email: ${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);
}





router.put('/:mid', upload.none(), async (req, res) => {
    try {
        const { mid } = req.params;
        const updatedData = req.body;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields based on the form data
        user.email = updatedData.email || user.email;
        // user.name = updatedData.name || user.name;
        user.password = updatedData.password
            ? await bcrypt.hash(updatedData.password, 10)
            : user.password;
        user.mobileNo = updatedData.mobileNo || user.mobileNo;
        // user.mid = updatedData.mid || user.mid;
        user.verified = updatedData.verified || user.verified;
        user.verificationToken = updatedData.verificationToken || user.verificationToken;
        user.payment_history = updatedData.payment_history || user.payment_history;
        user.purchased_items = updatedData.purchased_items || user.purchased_items;
        user.reward_points = updatedData.reward_points || user.reward_points;
        // user.pic_url = updatedData.pic_url || user.pic_url;
        user.auth_code = updatedData.auth_code || user.auth_code;
        user.address = updatedData.address || user.address;
        user.bio = updatedData.bio || user.bio;
        user.birth_date = updatedData.birth_date || user.birth_date;
        user.country = updatedData.country || user.country;
        user.fname = updatedData.fname || user.fname;
        user.gender = updatedData.gender || user.gender;
        user.lname = updatedData.lname || user.lname;
        user.phn = updatedData.phn || user.phn;
        user.rating = updatedData.rating || user.rating;
        user.zipcode = updatedData.zipcode || user.zipcode;
        user.kyc_status = updatedData.kyc_status || user.kyc_status;
        user.suspend_reason = updatedData.suspend_reason || user.suspend_reason;
        // Add more fields as needed

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// userRoutes.js
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;

        // Find the user with the verification token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(404).json({ message: 'Invalid verification token' });
        }

        // Update the user's status to "verified" and clear the verification token
        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});







router.post('/signin',upload.none(), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if the user's email is verified
        if (!user.verified) {
            return res.status(403).json({ message: 'Email not verified' });
        }

        // Compare the entered password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate and return an authentication token
        const authToken = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        res.status(200).json({ message: 'Sign-in successful', authToken });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/users/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter unread messages
        const unreadMessages = user.data.messages.filter(message => !message.readed);

        // Update readed status to true for unread messages
        unreadMessages.forEach(message => {
            message.readed = true;
        });

        // Mark the 'data.messages' array as modified
        user.markModified('data.messages');

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ unreadMessages });
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/usersnot/:mid', async (req, res) => {
    try {
      const { mid } = req.params;
  
      // Find the user by mid
      const user = await User.findOne({ mid });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Retrieve the messages from the user's data
      const messages = user.data.messages;
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// userRoutes.js
    router.post('/users/:mid', upload.none(),async (req, res) => {
        try {
            const { mid } = req.params;
            const newMessage = req.body;
    
            // Find the user by mid
            const user = await User.findOne({ mid });
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Add the new message to the 'messages' array
            user.data.messages.push(newMessage);
    
            // Mark the 'data.messages' array as modified
            user.markModified('data.messages');
    
            // Save the updated user to the database
            await user.save();
    
            res.status(201).json({ message: 'Message added successfully', user });
        } catch (error) {
            console.error('Error adding message:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });






router.get('/:mid', async (req, res) => {
    try {
        const user = await User.findOne({ mid: req.params.mid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user by UID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        console.log(users);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// router.get('/sample', async (req, res) => {
//     try {
//         const users = await User.find();
//         console.log(users);
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error getting users:', error);
//         res.status(500).json({ message: 'Internal Server Error', error: error.message });
//     }
// });



router.get('/getMessages/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // readed only true

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the user's messages
        const messages = user.data.messages;

        res.status(200).json({ success: true, data: { messages, mid: user.mid } });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});









// userRoutes.js

router.put('/suspend/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Suspend the user by setting the suspend_reason
        user.suspend_reason = req.body.suspend_reason || 'No specific reason provided';

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'User suspended successfully', user });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// userRoutes.js

router.put('/topup/:mid', async (req, res) => {
    try {
        const { mid } = req.params;
        const { amount } = req.body;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Top up the user's reward_points by the provided amount
        user.cashback_points = (user.cashback_points || 0) + parseInt(amount, 10);

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: 'Amount topped up successfully', user });
    } catch (error) {
        console.error('Error topping up amount:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






router.get('/export/:mid', async (req, res) => {
    try {
        const { mid } = req.params;

        // Find the user by mid
        const user = await User.findOne({ mid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a JSON file with user data
        const userData = JSON.stringify(user);
        const fileName = `user_data_${user.mid}.json`;

        fs.writeFileSync(fileName, userData);

        // Send the file as a response
        res.status(200)
            .attachment(fileName)
            .sendFile(fileName, {}, (err) => {
                if (err) {
                    console.error('Error exporting user data:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    // Remove the file after sending
                    fs.unlinkSync(fileName);
                }
            });
    } catch (error) {
        console.error('Error exporting user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// need in exel file 








//-----------------------------------------THIS IS IF WE NEED THE MID EMAIL VERIFICATION---------------------------//

// router.post('/send-email', async (req, res) => {
//     try {
//         const { mid } = req.body;

//         // Check if the mid exists in the database
//         const user = await User.findOne({ mid });
//         // const user = await User.findOne({ mid });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found with the provided MID' });
//         }
        
//         console.log('User:', user);
        
//         // Send email to the user
//         await sendEmail(user);

//         res.status(200).json({ message: 'Email sent successfully' });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Helper function to send an email
// async function sendEmail(user) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'Harshkhosla9945@gmail.com',
//             pass: 'smos vryu mccy rhqp',
//         },
//     });

//     const mailOptions = {
//         from: 'Harshkhosla9945@gmail.com',
//         to: user.email, // Using the user's email as the recipient
//         subject: 'Subject: Your Unique MID',
//         text: `Dear ${user.name},\n\nYour unique MID is: ${user.mid}`,
//     };

//     await transporter.sendMail(mailOptions);
// }


//---------------------------------------------NOT COMPULSORY TO USE IT -----------------------------------------//

// // userRoutes.js
// async function sendEmail(user) {
//     const verificationLink = `http://localhost:3000/user/verify?token=${user.verificationToken}`;

//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'Harshkhosla9945@gmail.com',
//             pass: 'smos vryu mccy rhqp',
//         },
//     });

//     const mailOptions = {
//         from: 'Harshkhosla9945@gmail.com',
//         to: user.email,
//         subject: 'Subject: Your Unique MID',
//         text: `Dear ${user.name},\n\nYour unique MID is: ${user.mid}\n\nPlease click on the following link to verify your email: ${verificationLink}`,
//     };

//     await transporter.sendMail(mailOptions);
// }



module.exports = router;
