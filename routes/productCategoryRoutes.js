const express = require('express');
const multer = require('multer');
const ProductCategory = require('../models/productCategory');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const path = require('path');
const router = express.Router();
const excel = require('exceljs');




async function generateCategoryExcel(categories) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Product Categories');

  // Add headers
  worksheet.addRow(['Category ID', 'Category Name', 'Description']);

  // Add data
  categories.forEach(category => {
      worksheet.addRow([category.category_id, category.category_name, category.description]);
  });

  // Save the workbook as a buffer
  return await workbook.xlsx.writeBuffer();
}


// Configure multer storage
const uploadDirectory = '/var/www/html/tss_files/productCategory';
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


router.get('/downloadCategoryExcel', async (req, res) => {
  try {
      const categories = await ProductCategory.find({}, { _id: 0, __v: 0 });

      if (categories.length === 0) {
          return res.status(404).json({ message: 'No categories found' });
      }

      const excelData = await generateCategoryExcel(categories);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=productCategories.xlsx');

      res.send(excelData);
  } catch (error) {
      console.error('Error exporting product categories:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { categoryName, additionalField } = req.body;
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
    // Handle the image file as needed
    const imageBuffer = req.file.buffer;
    const uniqueFileName = req.file.filename;
      
    // Create the URL using the filename
    const url = `http://64.227.186.165/tss_files/productCategory/${uniqueFileName}`;

    const newProductCategory = new ProductCategory({
      categoryName,
      additionalField,
      image: imageBuffer,
      image1: url,
    });

    await newProductCategory.save();

    res.status(201).json({ message: 'Product Category created successfully' });
  } catch (error) {
    console.error('Error creating Product Category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read
router.get('/', async (req, res) => {
  try {
    const productCategories = await ProductCategory.find();
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
    console.log(userRole,"harsh");
    const userPermissionsArray = await Role.findOne({ role: userRole });
    console.log(userPermissionsArray);
    // Check if the user has permission to read products in the "Inventory" category
    const canReadProducts = userPermissionsArray.permissions.some(permission =>
        permission.catg === 'Inventory' && permission.read
    );

    if (!canReadProducts) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    res.status(200).json(productCategories);
  } catch (error) {
    console.error('Error fetching Product Categories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productCategory = await ProductCategory.findById(req.params.id);
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
    if (!productCategory) {
      return res.status(404).json({ message: 'Product Category not found' });
    }
    res.status(200).json(productCategory);
  } catch (error) {
    console.error('Error fetching Product Category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { categoryName, additionalField } = req.body;
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

    // Handle the image file as needed
    const imageBuffer = req.file.buffer;

    const updatedProductCategory = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      {
        categoryName,
        additionalField,
        // image: imageBuffer,
      },
      { new: true }
    );

    if (!updatedProductCategory) {
      return res.status(404).json({ message: 'Product Category not found' });
    }

    res.status(200).json({
      message: 'Product Category updated successfully',
      updatedProductCategory,
    });
  } catch (error) {
    console.error('Error updating Product Category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
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
      const deletedProductCategory = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!deletedProductCategory) {
      return res.status(404).json({ message: 'Product Category not found' });
    }
    res.status(200).json({
      message: 'Product Category deleted successfully',
      deletedProductCategory,
    });
  } catch (error) {
    console.error('Error deleting Product Category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
