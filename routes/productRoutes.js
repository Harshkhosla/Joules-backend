const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const excel = require('exceljs'); 
const { Readable } = require('stream');
const router = express.Router();
const ExcelJS = require('exceljs');

const path = require('path');


// const uploadDirectory = '/var/www/html/tss_files/product';

const uploadDirectory = 'uploads';
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
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validate file type or any other conditions here
    // For example, allow only certain file types
    const allowedFileTypes = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedFileTypes.includes(fileExtension)) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  },
});



router.post('/uploadProductsExcel', upload.single('excelFile'), async (req, res) => {
  try {
      // Check if a file is provided
      console.log('Buffer size:', req.file);
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create a readable stream from the buffer
        const bufferStream = new Readable();
        bufferStream._read = () => {};
        bufferStream.push(req.file);
        bufferStream.push(null);

        // Parse Excel file using the readable stream
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.read(bufferStream);
        const worksheet = workbook.getWorksheet(1);

      // Extract data from Excel
      const products = [];
      worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {  // Skip header row
              const product = {
                  // Extract values from each column and map to your product schema
                  pid: row.getCell(1).value,
                  product_name: row.getCell(2).value,
                  desc: row.getCell(3).value,
                  fit: row.getCell(4).value,
                  discount: row.getCell(5).value,
                  discount_type: row.getCell(6).value,
                  discount_date: {
                      start: row.getCell(7).value,
                      end: row.getCell(8).value,
                  },
                  category: row.getCell(9).value,
                  sub_category: row.getCell(10).value,
                  selling_price: row.getCell(11).value,
                  quantity_pi: row.getCell(12).value,
                  reward_points: row.getCell(13).value,
                  sku: row.getCell(14).value,
                  sales: row.getCell(15).value,
                  tags: row.getCell(16).value,
                  thumbnail_image: { url: row.getCell(17).value },
                  unit: row.getCell(18).value,
                  unit_price: row.getCell(19).value,
                  variantEnabled: row.getCell(20).value,
                  product_desc: row.getCell(21).value,
                  colors: row.getCell(22).value.split(',').map(color => color.trim()), // Assuming colors is a comma-separated string
                  variants: row.getCell(23).value.split(',').map(variant => variant.trim()), // Assuming variants is a comma-separated string
                  size: row.getCell(24).value.split(',').map(size => size.trim()), // Assuming size is a comma-separated string
                  shipping_returns: row.getCell(25).value,
                  fabric: row.getCell(26).value,
                  about: row.getCell(27).value,
                  refund: row.getCell(28).value,
                  rating: row.getCell(29).value,
                  draft: row.getCell(30).value,
                  product_detail: row.getCell(31).value,
                  SEOArea: {
                      metaTitle: row.getCell(32).value,
                      metaDescription: row.getCell(33).value,
                      metaKeywords: row.getCell(34).value,
                      images1: row.getCell(35).value,
                  },
              };
              products.push(product);
          }
      });

      // Save products to the database
      await Product.insertMany(products);

      // Respond with success message
      return res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
      console.error('Error uploading products:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/top3products', async (req, res) => {
  try {
      // Find the top 3 products based on sales (you might need to adjust the field names)
      const topProducts = await Product.find().sort({ sales: -1 }).limit(3);

      res.status(200).json(topProducts);
  } catch (error) {
      console.error('Error getting top products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


async function generateExcel(products) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  // Add headers
  worksheet.addRow([
    'Product ID',
    'Product Name',
    'Description',
    'Fit',
    'Discount',
    'Discount Type',
    'Discount Start Date',
    'Discount End Date',
    'Category',
    'Sub Category',
    'Selling Price',
    'Quantity Available',
    'Reward Points',
    'SKU',
    'Sales',
    'Tags',
    'Thumbnail Image URL',
    'Unit',
    'Unit Price',
    'Variant Enabled',
    'Product Description',
    'Colors',
    'Variants',
    'Size',
    'Shipping & Returns',
    'Fabric',
    'About',
    'Refund',
    'Rating',
    'Draft',
    'Product Detail',
    'SEO Meta Title',
    'SEO Meta Description',
    'SEO Meta Keywords',
    'SEO Images URL',
]);

// Add data
products.forEach(product => {
    worksheet.addRow([
        product.pid,
        product.product_name,
        product.desc,
        product.fit,
        product.discount,
        product.discount_type,
        product.discount_date.start,
        product.discount_date.end,
        product.category,
        product.sub_category,
        product.selling_price,
        product.quantity_pi,
        product.reward_points,
        product.sku,
        product.sales,
        product.tags,
        product.thumbnail_image.url,
        product.unit,
        product.unit_price,
        product.variantEnabled,
        product.product_desc,
        product.colors.map(color => color.name).join(', '), // Display color names as a comma-separated string
  product.variants.map(variant => variant.name).join(', '), // Display variant names as a comma-separated string
  product.size.map(size => size.name).join(', '), // Assuming size is an array
        product.shipping_returns,
        product.fabric,
        product.about,
        product.refund,
        product.rating,
        product.draft,
        product.product_detail,
        product.SEOArea.metaTitle,
        product.SEOArea.metaDescription,
        product.SEOArea.metaKeywords,
        product.SEOArea.images1,
    ]);
});

  // Save the workbook as a buffer
  return await workbook.xlsx.writeBuffer();
}



router.get('/downloadProductsExcel', async (req, res) => {
  try {
      // Fetch products from the database
      const products = await Product.find({}, { _id: 0, __v: 0 });

      if (products.length === 0) {
          return res.status(404).json({ message: 'No products found' });
      }

      // Generate Excel sheet
      const excelData = await generateExcel(products);

      // Set headers for the Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

      // Send the Excel file as a buffer
      res.send(excelData);
  } catch (error) {
      console.error('Error exporting products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Create




router.post('/', async (req, res) => {
    try {
      const productData = req.body;
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
  
      // Generate a unique pid
      const pid = uuid.v4();
      productData.pid = pid;
  
      // if (req.files) {
      //   // Loop through the fields and update the data with URLs and buffers
      //   Object.keys(req.files).forEach(fieldName => {
      //     const file = req.files[fieldName][0];
      //     const uniqueFileName = file.filename;
      //     const url = `http://64.227.186.165/tss_files/product/${uniqueFileName}`;
  
      //     // Update the aboutData object with URL and buffer
      //     productData[fieldName] = {
      //       buffer: file.buffer,
      //       url: url,
      //     };
      //   });
      // }
      const newProduct = new Product(productData);
      await newProduct.save();
  
      res.status(201).json({ message: 'Product created successfully', pid });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Read
router.get('/', async (req, res) => {
  try {
      //Get the authentication token from the request headers or wherever it is stored
      const authToken = req.headers.authorization;
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
      console.log(userRole);
      const userPermissionsArray = await Role.findOne({ role: userRole });
      console.log(userPermissionsArray);
      // Check if the user has permission to read products in the "Inventory" category
      const canReadProducts = userPermissionsArray.permissions.some(permission =>
          permission.catg === 'Inventory' && permission.read
      );

      if (!canReadProducts) {
          return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      // If permissions are valid, proceed with fetching products
      const products = await Product.find();
      res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});



  router.get('/:pid', async (req, res) => {
    try {
      const product = await Product.findOne({ pid: req.params.pid });
      const authToken = req.headers.authorization;
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
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // Update
  router.put('/:pid', async (req, res) => {
    try {
      const updatedData = req.body;
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
      // Convert image buffers
      // if (req.files['gallery_images']) {
      //   updatedData.gallery_images = req.files['gallery_images'].map(image => image.buffer);
      // }
      // if (req.files['thumbnail_image']) {
      //   updatedData.thumbnail_image = req.files['thumbnail_image'][0].buffer;
      // }
      if (req.file) {
        const uniqueFileName = req.file.filename;
        // Update the user's pic_url
        console.log( req.body);
        // req.body.pic_url = `http://64.227.186.165/tss_files/home/${uniqueFileName}`;
    }
      const updatedProduct = await Product.findOneAndUpdate({ pid: req.params.pid }, updatedData, { new: true });
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product updated successfully', updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // router.get('/sproduct', async (req, res) => {
    router.get('/data/product', async (req, res) => {
      try {
        const products = await Product.find();
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
        if (!products || products.length === 0) {
          return res.status(404).json({ message: 'No products found' });
        }
    
        // Map products to include only the specified fields
        const formattedProducts = products.map(product => ({
          pid: product.pid,
          pic_url: product.pic_url || "", // Set default value if pic_url is undefined
          name: product.name || "", // Set default value if name is undefined
          qty_sold: product.qty_sold || 0, // Set default value if qty_sold is undefined
          unit_price: product.unit_price || 0, // Set default value if unit_price is undefined
          currency: product.currency || "", // Set default value if currency is undefined
          avg_rating: product.avg_rating || 0 // Set default value if avg_rating is undefined
        }));
    
        res.status(200).json(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    
  
  // Delete
  router.delete('/:pid', async (req, res) => {
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
      const deletedProduct = await Product.findOneAndDelete({ pid: req.params.pid });
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;
  