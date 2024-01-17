const express = require('express');
const multer = require('multer');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();
const path = require('path');
const Transaction=require("../models/Transaction")
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');
const Product = require('../models/product');
// const Transaction=require("../models/Transaction");
const product = require('../models/product');
const exceljs = require('exceljs');
const uploadDirectory = '/var/www/html/tss_files/order';
// const uploadDirectory = 'uploads';


function generateUniqueMid() {
  // Logic to generate a unique mid (for example, using a combination of timestamp and a random number)
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `TID${timestamp}${randomNum}`;
}


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

function generateUniquemsgid() {
  return `msgID${Date.now()}`;
}

const upload = multer({ storage: storage });

// Create


router.get('/export', async (req, res) => {
  try {
    const orders = await Order.find(); // Retrieve all orders from the database

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define the headers for the Excel file based on your Order schema
    worksheet.columns = [
      { header: 'Order ID', key: 'oid', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Payment Mode', key: 'payment_mode', width: 15 },
      { header: 'Tracking ID', key: 'tracking_id', width: 15 },
      { header: 'Delivery Status', key: 'delivery_status', width: 15 },
      { header: 'Payment Status', key: 'payment_status', width: 15 },
      { header: 'Email', key: 'email', width: 15 },
      { header: 'Shipping Address', key: 'shipping_addr', width: 15 },
      { header: 'Contact', key: 'contact', width: 15 },
      { header: 'Username', key: 'uname', width: 15 },
      { header: 'Coupon', key: 'coupon', width: 15 },
      { header: 'Shipping Cost', key: 'shipping', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Promotion ID', key: 'promotion_id', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 15 },
      // Add more headers for product data based on your productSchema
      { header: 'Product ID', key: 'products.pid', width: 15 },
      { header: 'Product Name', key: 'products.product_name', width: 15 },
      { header: 'Price', key: 'products.price', width: 15 },
      { header: 'Photo', key: 'products.photo', width: 15 },
      { header: 'Count', key: 'products.count', width: 15 },
      { header: 'Reward Points', key: 'products.reward_points', width: 15 },
    ];

    // Add data to the worksheet
    orders.forEach(order => {
      order.products.forEach(product => {
        worksheet.addRow({
          oid: order.oid,
          amount: order.amount,
          payment_mode: order.payment_mode,
          tracking_id: order.tracking_id,
          delivery_status: order.delivery_status,
          payment_status: order.payment_status,
          email: order.email,
          shipping_addr: order.shipping_addr,
          contact: order.contact,
          uname: order.uname,
          coupon: order.coupon,
          shipping: order.shipping,
          subtotal: order.subtotal,
          tax: order.tax,
          promotion_id: order.promotion_id,
          date: order.date,
          time: order.time,
          'products.pid': product.pid,
          'products.product_name': product.product_name,
          'products.price': product.price,
          'products.photo': product.photo,
          'products.count': product.count,
          'products.reward_points': product.reward_points,
        });
      });
    });

    // Set up the response headers for Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    // Send the Excel file to the client
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', upload.fields([
  { name: 'products[1][photo1]', maxCount: 1 }
]), async (req, res) => {
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
      permission.catg === 'User' && permission.create
      );
      
    if (!canReadProducts) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
  const orderData = req.body;

  
  if (req.files && req.files['products[1][photo1]']) {
    const uniqueFileName = req.files['products[1][photo1]'][0].filename;

    // Create the URL using the filename
    const url = `http://64.227.186.165/tss_files/order/${uniqueFileName}`;

    // Update the orderData with the URL and buffer
    orderData.products[0]['photo'] = url; // Assuming there's only one product in the order
    orderData.products[0]['photo1'] = req.files['products[1][photo1]'][0].buffer;
  }
  const productPids = orderData.products.map(product => product.pid);

  // console.log(productPids);
  productPids.map(async(e)=>{
    const data  = await Product.findOne({pid:e})
    // data.sales=0;
    data.sales=data.sales+1;
    await product.updateOne({pid:e},{sales: data.sales})
    // console.log(data.sales);
  })
  
  // const newOrder1 = new Product(data);
  // await newOrder1.save();
  // console.log(req.body.products);

  const totalRewardPoints = orderData.products.reduce((sum, product) => {
    // Assuming each product has a reward_points field
    return sum + parseInt(product.reward_points, 10) || 0;
  }, 0);

  const user = await User.findOne({ mid: orderData.mid });
  const trans = await Transaction.findOne({ mid: orderData.mid });
  
  // console.log(orderData);
 
  const UpdateData=Transaction({
    status:"Credited",
    amt:totalRewardPoints,
    date:orderData.date,
    time:orderData.time,
    mid:orderData.mid,
    transaction_id:generateUniqueMid(),
    oid:orderData.oid
  })
 const result=await UpdateData.save()


  const Messages={
    date:orderData.date,
    time:orderData.time,
    msg_id:generateUniquemsgid(),
    msg:"Your order had been successfully placed!",
    readed:false,
    sender_uid:orderData.mid,
    sender_uname:"System",
  }

  user.data.messages.push(Messages)
  const Messagess={
    date:orderData.date,
    time:orderData.time,
    msg_id:generateUniquemsgid(),
    msg:`Congratulations! ${totalRewardPoints} reward pts added for your recent purchase`,
    readed:false,
    sender_uid:orderData.mid,
    sender_uname:"System",
  }

  user.data.messages.push(Messagess)
const result1=await user.save()
// console.log(orderData.products[0].count);

let sum=0
orderData.products.map((v)=>{return sum=sum+Number(v.count)})

  if (user) {
    user.reward_points = (user.reward_points || 0) + totalRewardPoints;
    user.payment_history=(user.payment_history)+Number(req.body.amount)
    user.purchased_items=(user.purchased_items)+sum
    await user.save();
  }




  const newOrder = new Order(orderData);
  await newOrder.save();

  res.status(201).json({ message: 'Order created successfully' });
} catch (error) {
  console.error('Error creating order:', error);
  res.status(500).json({ message: 'Internal Server Error' });
}
});



// Read all orders
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
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Read single order by ID
router.get('/:id', async (req, res) => {
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
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/samp/:mid', async (req, res) => {
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
    const orders = await Order.find({ mid: req.params.mid });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the provided mid' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update
// Update
router.put('/:id', upload.single('products[1][photo1]'), async (req, res) => {
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
    const updatedOrderData = req.body;

    // Check if a file was uploaded
    if (req.file) {
      const uniqueFileName = req.file.filename;
      
      // Create the URL using the filename
      const url = `http://64.227.186.165/tss_files/order/${uniqueFileName}`;
      console.log(url);

      // Update the orderData with the URL and buffer
      updatedOrderData['photo'] = url;
      updatedOrderData['photo1'] = req.file.buffer;
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updatedOrderData, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order updated successfully', updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
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
      permission.catg === 'User' && permission.delete
      );
      
    if (!canReadProducts) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully', deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
