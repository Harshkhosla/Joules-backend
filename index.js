const ConnectToMongo = require('./db');
const express = require('express');
const http = require('http');  // Add the http module
const socketIo = require('socket.io');
var cors = require('cors')
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userManagementRoutes = require('./routes/User_ManagementRoutes');
const departmentRoutes = require('./routes/DepartmentRoutes');
const roleRoutes = require('./routes/RoleRoutes');
const settingRoutes = require('./routes/settingsRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const footerRoutes = require('./routes/footerRoutes');
const pagesRoutes = require('./routes/pagesRoutes');
const homeRoutes = require('./routes/homeRoutes');
const aboutRoutes = require('./routes/aboutRoutes.js');
const contactRoutes = require('./routes/contactRoutes.js');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const generalConfigRoutes = require('./routes/generalConfigRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const productRoutes = require('./routes/productRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/BannerRoute.js');
const productCategoryRoutes = require('./routes/productCategoryRoutes');
const OrderRoutes = require('./routes/OrderRoutes.js');
const reviewRoutes = require('./routes/reviewController');
const transactionRoutes = require('./routes/transactions');
const looksRoutes = require('./routes/looksRoutes');
const pageController = require('./routes/pageController.js');

ConnectToMongo();
const app = express();
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));
const server = http.createServer(app);  // Create an HTTP server



// const socket = io('http://localhost:5000');
const io = socketIo(server); 

// Define Ticket Schema
const ticketSchema = new mongoose.Schema({
  tid: String,
  uid: String,
  usname: String,
  subj: String,
  status: String,
  msgs: [
    {
      cid: Number,
      date: String,
      msg: String,
      role: String,
      time: String,
    },
  ],
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle new ticket creation
  socket.on('createTicket', async (ticketData) => {
    try {
      // Check if a ticket with the given UID already exists
      const existingTicket = await Ticket.findOne({ uid: ticketData.uid });

      if (existingTicket) {
        // Ticket already exists, emit an event to notify the user
        io.to(socket.id).emit('ticketExists', { tid: existingTicket.tid });
      } else {
        // Create a new ticket
        const newTicket = new Ticket({
          tid: ticketData.uid,
          uid: ticketData.uid,
          usname: ticketData.usname,
          subj: ticketData.subj,
          status: 'Open',
          msgs: [],
        });

        // Save the ticket to the database
        await newTicket.save();

        // Emit an event to notify the user with the newly created ticket ID
        io.to(socket.id).emit('ticketCreated', { tid: newTicket.tid });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  });

  // Handle admin reply to a ticket
  socket.on('adminReply', async (replyData) => {
    try {
      // Find the ticket by ID
      const ticket = await Ticket.findOne({ tid: replyData.tid });

      if (ticket) {
        // Add the admin's reply to the ticket's msgs array
        const newMsg = {
          cid: mongoose.Types.ObjectId().getTimestamp(),
          date: new Date().toLocaleDateString(),
          msg: replyData.msg,
          role: 'admin',
          time: new Date().toLocaleTimeString(),
        };

        ticket.msgs.push(newMsg);

        // Save the updated ticket to the database
        await ticket.save();

        // Emit an event to notify the user with the admin's reply
        io.to(socket.id).emit('adminReplied', { newMsg, tid: replyData.tid });
      }
    } catch (error) {
      console.error('Error replying to ticket:', error);
    }
  });

  // Handle user request for ticket details
  socket.on('getTicket', async (tid) => {
    try {
      // Find the ticket by ID
      const ticket = await Ticket.findOne({ tid });

      if (ticket) {
        // Emit an event to send the ticket details to the user
        io.to(socket.id).emit('ticketDetails', { data: { ...ticket._doc }, success: true });
      } else {
        // Emit an event to notify the user if the ticket is not found
        io.to(socket.id).emit('ticketNotFound', { success: false });
      }
    } catch (error) {
      console.error('Error getting ticket details:', error);
    }
  });


  socket.on('toggleTicketStatus', async (tid) => {
    try {
      // Find the ticket by ID
      const ticket = await Ticket.findOne({ tid });
  
      if (ticket) {
        // Toggle the ticket status between 'Open' and 'Closed'
        ticket.status = ticket.status === 'Open' ? 'Closed' : 'Open';
  
        // Save the updated ticket to the database
        await ticket.save();
  
        // Emit an event to notify the user about the updated status
        io.to(socket.id).emit('ticketStatusUpdated', { tid, status: ticket.status });
      }
    } catch (error) {
      console.error('Error toggling ticket status:', error);
    }
  });



  
  io.to(socket.id).emit('ticketStatusUpdated', { tid, status: ticket.status });
  
  
  
  socket.on('ticketStatusUpdated', ({ tid, status }) => {
    // Handle the event, e.g., update the UI to reflect the updated ticket status
    console.log(`Ticket ${tid} status updated to ${status}`);
  });



});






app.use(express.json());

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/user_management', userManagementRoutes);
app.use('/departments', departmentRoutes);
app.use('/roles', roleRoutes);
app.use('/settings', settingRoutes);
app.use('/cms', cmsRoutes);
app.use('/footer', footerRoutes);
app.use('/pages', pagesRoutes);
app.use('/home', homeRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);
app.use('/promo-code', promoCodeRoutes);
app.use('/general-config', generalConfigRoutes);
app.use('/catalog', catalogRoutes);
app.use('/product', productRoutes);
app.use('/promotion', promotionRoutes);
app.use('/categories', categoryRoutes);
app.use('/productCategory', productCategoryRoutes);
app.use('/banner', bannerRoutes);
app.use('/oders', OrderRoutes);
app.use('/review', reviewRoutes);
app.use('/transactions', transactionRoutes);
app.use('/looks', looksRoutes);
app.use('/page', pageController);




const PORT = process.env.PORT || 5200;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
