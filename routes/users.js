const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');
const {straightAuth} = require('../config/auth');
const { route } = require('.');

router.get('/login', straightAuth, (req, res) => res.render('login'));

router.get('/register', straightAuth, (req, res) => res.render('register'));



router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({msg: 'Заполните все поля'});
    }

    if (password != password2) {
        errors.push({msg: 'Пароли не сходятся'});
    }

    if (password.length < 6) {
        errors.push({msg: 'длина пароля более 6 символов'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({email: email}).then(user => {
            if (user) {
                errors.push({msg: 'Вы уже вошли'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save() 
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'Вы зарегистрировались и можете войти'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/PersonalArea',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Вы вышли');
    res.redirect('/users/login');
});


module.exports = router;

