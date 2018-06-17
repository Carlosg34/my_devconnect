const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load validation
const validateProfileInput = require("../../validation/profile");

//Load Profile and User model
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//Route: Get api/profile/test
//Desc: Test profile route
//Access: public
router.get("/test", (req, res) =>
    res.json({
        msg: "Profile Works"
    })
);

/****************************************/
//Route: Get api/profile---gets 'current' user profile
//Desc: Get current user profile
//Access: private
router.get(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const errors = {};
        Profile.findOne({
                user: req.user.id
            })
            .populate("user", ["name", "avatar"])
            .then(profile => {
                if (!profile) {
                    errors.profile = "There is no profile for this user";
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);
/*****************************************************/

//Route: POST api/profile/all
//Desc: get all profiles
//Access: public
router.get("/all", (req, res) => {
    const errors = {};
    Profile.find()
        .populate("user", ["name", "avatar"])
        .then(profiles => {
            //check if user profile exist
            if (!profiles) {
                errors.noprofile = "There are no profiles";
                return res.status(404).json(errors);
            }
            //response if there are any profiles
            res.json(profiles);
        })
        .catch(err => res.status(400).json({
            profiles: "There are no profiles"
        }));
});

/******************************************************/
//Route: POST api/profile/handle/:hanlde
//Desc: get profile by handle
//Access: public
router.get("/handle/:handle", (req, res) => {
    const errors = {};
    Profile.findOne({
            handle: req.params.handle
        })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            //check if user profile exist
            if (!profile) {
                errors.profile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            //response if profile exist
            res.json(profile);
        })
        .catch(err => res.status(400).json(err));
});
/******************************************************/

//Route: POST api/profile/user/:user_id
//Desc: get profile by user id
//Access: public
router.get("/user/:user_id", (req, res) => {
    const errors = {};
    Profile.findOne({
            user: req.params.user_id
        })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            //check if user profile exist
            if (!profile) {
                errors.profile = "There is no profile for this user";
                res.status(404).json(errors);
            }
            //response if profile exist
            res.json(profile);
        })
        .catch(err =>
            res.status(400).json({
                profile: "There is not profile for this users"
            })
        );
});

/***************************************/
//Route: POST api/profile
//Desc: create or edit user profile
//Access: private
router.post(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const {
            errors,
            isValid
        } = validateProfileInput(req.body);
        //check validation
        if (!isValid) {
            //return any errors with 400 status
            return res.status(400).json(errors);
        }

        //get fields
        const profileFileds = {};
        profileFileds.user = req.user.id;
        if (req.body.handle) profileFileds.handle = req.body.handle;
        if (req.body.occupation) profileFileds.occupation = req.body.occupation;
        profileFileds.social = {};
        if (req.body.linkedin) profileFileds.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileFileds.social.instagram = req.body.instagram;
        if (req.body.tweeter) profileFileds.social.tweeter = req.body.tweeter;
        if (req.body.facebook) profileFileds.social.facebook = req.body.facebook;
        if (req.body.bio) profileFileds.bio = req.body.bio;

        Profile.findOne({
            user: req.user.id
        }).then(profile => {
            if (profile) {
                //if profile exist, update
                Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFileds
                }, {
                    new: true
                }).then(profile => res.json(profile));
            } else {
                //if profile doesn't exist, create
                //check if handle exist
                Profile.findOne({
                    handle: profileFileds.handlde
                }).then(profile => {
                    if (profile) {
                        errors.handle = "Handle already exists";
                        res.status(400).json(errors);
                    }
                    //save profile
                    new Profile(profileFileds).save().then(profile => res.json(profile));
                });
            }
        });
    }
);
/****************************************************/

//Route: Delete api/profile
//Desc: Delete user profile
//Access: private
router.delete('/', passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        Profile.findOneAndRemove({
            user: req.user.id
        }).then(() => {
            User.findOneAndRemove({
                _id: req.user.id
            }).then(() => {
                res.json({
                    success: true
                })
            });
        });
    }
);

module.exports = router;