require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const {apiLimiter,authLimiter,complaintLimiter} = require('./middleware/rateLimiter');

const app = express();

app.use(helmet({ crossOriginResourcePolicy:{policy:'cross-origin'} }));
app.use(cors({ origin: process.env.FRONTEND_URL||'http://localhost:5173', credentials:true }));
app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true,limit:'2mb'}));

// Rate limiting
app.use('/api/',           apiLimiter);
app.use('/api/auth/',      authLimiter);
app.use('/api/complaints', complaintLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/officer',    require('./routes/officerRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/rewards',    require('./routes/rewardsRoutes'));
app.use('/api/ai',         require('./routes/aiRoutes'));

// Health
app.get('/', (req,res) => res.json({
  message:'Smart Cities API ✓', version:'2.0.0',
  features:['AI Detection','Priority Scoring','Nearby Detection','Rewards','Heatmap','Before/After','Emergency Reporting','Multilingual'],
}));

// 404
app.use((req,res) => res.status(404).json({error:`${req.method} ${req.path} not found`}));

// Error handler
app.use((err,req,res,next) => {
  console.error(err.stack);
  res.status(500).json({error: process.env.NODE_ENV==='production' ? 'Internal server error' : err.message});
});

const PORT = process.env.PORT||5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT} — v2.0.0 with all 15 features`));