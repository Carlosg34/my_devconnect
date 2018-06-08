const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Load User model
const User = require('../../models/User');

//Route: 'Get' api/users/test
//Desc Test users route
// Access public
router.get('/test', (req, res) => res.json({
    msg: "Users Work"
}));

//Route: 'Post' api/users/register
//Desc Test users route
// Access public
router.post('/register', (req, res) => {
    const {
        errors,
        isValid
    } = validateRegisterInput(req.body);

    //check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            error.email = 'Email already exist';
            return res.status(400).json(errors);
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '50', //size
                r: 'pg', //Rating
                d: 'mm' // Default--img
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });

            });
        }
    });
});

//Route: 'Post' api/users/login
//Desc Login User/ Returning JWT token
// Access public
router.post('/login', (req, res) => {
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);
    //check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //find user by email
    User.findOne({
            email
        })
        .then(user => {
            //check if user exist
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            //if user found---check/match Password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //user matched
                        //create JWt payload
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        }

                        //sign token
                        jwt.sign(
                            payload, keys.secretOrKey, {
                                expiresIn: 86000
                            },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            }
                        );
                    } else {
                        errors.password = 'Password incorrect'
                        return res.status(400).json(errors);
                    }
                })
        });
});

//Route: 'GET' api/users/current
//Desc: return current user
// Access: private
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router