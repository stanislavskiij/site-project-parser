const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
require('./config/passport')(passport);
const db = require('./config/dbInf').db;


mongoose
    .connect(
        db,
        {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
const app = express();

app.use(expressLayouts);

app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/users', require('./routes/users.js'));
app.use('/', require('./routes/index.js'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Сервер запустился, он чилит на порте:  ${PORT}`));


