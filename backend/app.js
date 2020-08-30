const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const expressSanitizer = require('express-sanitizer');
const multer = require('multer');

const indexRoutes = require('./routes/index');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const caseRouter = require('./routes/case');

require('./passport')(passport);


const app = express();

const upload = multer();

const PORT = process.env.PORT || 3001;

// Mongo Config

mongoose.connect("mongodb://localhost:27017/legal_aid_centre",{useUnifiedTopology: true,useNewUrlParser: true})
.then( () => {
    console.log("Database Connected");
}).catch((err) => {
    console.log(err);
});

// EJS Setup

app.use(expressLayouts);
app.set('view engine', 'ejs' );

app.use(express.static('public'));

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// Express Session Setup

app.use(session({
    secret: 'legal_aid_centre',
    resave: true,
    saveUninitialized: true,
  }));

// Passport setup 

app.use(passport.initialize());
app.use(passport.session());

// Flash Setup

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})


// Routes

app.use('/',indexRoutes);
app.use('/users',usersRoutes);
app.use('/admin',adminRoutes);
app.use('/cases',caseRouter);


app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
})