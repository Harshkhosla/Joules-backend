const express = require('express');
const router = express.Router();
const TermsAndConditions = require('../models/termsAndConditions');
const PrivacyPolicy = require('../models/privacyPolicy');
const RefundPolicy = require('../models/refundPolicy');
const Header = require('../models/header');
const path = require("path");
const Role = require('../models/Role');
const multer = require("multer");
const jwt = require('jsonwebtoken');
// const upload = multer();
//  const uploadDirectory = "uploads"; // Change the upload directory as needed
const uploadDirectory = '/var/www/html/tss_files/home'; // Change the upload directory as needed

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


function generateUniqueRid() {
  return `RID${Date.now()}`;
}

// API to create or update Terms and Conditions
router.get('/termsAndConditions', async (req, res) => {
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
    const doc = await TermsAndConditions.findOne();

    if (!doc) {
      return res.status(404).json({ message: 'Terms and Conditions not found' });
    }

    res.status(200).json({ content: doc.content });
  } catch (error) {
    console.error('Error retrieving Terms and Conditions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/termsAndConditions', upload.none(),async (req, res) => {
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
    const { content } = req.body;
    let doc = await TermsAndConditions.findOne();

    if (!doc) {
      doc = new TermsAndConditions({ content });
    } else {
      doc.content = content;
    }

    await doc.save();

    res.status(200).json({ message: 'Terms and Conditions updated successfully' });
  } catch (error) {
    console.error('Error updating Terms and Conditions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put("/header", upload.single("brand_logo"), async (req, res) => {
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
    // console.log(header);
  const { header } = req.body;
    let headerr = await Header.findOne();
    const files=req.file.filename
    console.log(files);
   
    if (!headerr) {
      headerr = new Header({ header });
    } else {
      headerr.header = header;


      // Check if a file is uploaded and update the 'header_image' property
      if (req.file) {
        headerr.brand_logo = {
          url: `http://64.227.186.165/tss_files/home/${files}`,
        };
      }
    }

    // Save the changes to the database
    await headerr.save();

    res.status(200).json({ message: "Header updated successfully", headerr });
  } catch (error) {
    console.error("Error updating Header:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get the header
router.get('/header', async (req, res) => {
  try {
    const headerr = await Header.findOne();
    console.log(headerr)
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

    if (!headerr) {
      return res.status(404).json({ message: 'Header not found' });
    }

    res.status(200).json({ headerr });
  } catch (error) {
    console.error('Error retrieving Header:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/privacyPolicy', async (req, res) => {
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
    const doc = await PrivacyPolicy.findOne();

    if (!doc) {
      return res.status(404).json({ message: 'Privacy Policy not found' });
    }

    res.status(200).json({ content: doc.content });
  } catch (error) {
    console.error('Error retrieving Privacy Policy:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// API to create or update Privacy Policy
router.post('/privacyPolicy', upload.none(),async (req, res) => {
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
    const { content } = req.body;
    let doc = await PrivacyPolicy.findOne();

    if (!doc) {
      doc = new PrivacyPolicy({ content });
    } else {
      doc.content = content;
    }

    await doc.save();

    res.status(200).json({ message: 'Privacy Policy updated successfully' });
  } catch (error) {
    console.error('Error updating Privacy Policy:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/refundPolicy', async (req, res) => {
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
    const doc = await RefundPolicy.findOne();

    if (!doc) {
      return res.status(404).json({ message: 'Refund Policy not found' });
    }

    res.status(200).json({ content: doc.content });
  } catch (error) {
    console.error('Error retrieving Refund Policy:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// API to create or update Refund Policy
router.post('/refundPolicy', upload.none(), async (req, res) => {
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
    const { content } = req.body;
    let doc = await RefundPolicy.findOne();

    if (!doc) {
      doc = new RefundPolicy({ content });
    } else {
      doc.content = content;
    }

    await doc.save();

    res.status(200).json({ message: 'Refund Policy updated successfully' });
  } catch (error) {
    console.error('Error updating Refund Policy:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
