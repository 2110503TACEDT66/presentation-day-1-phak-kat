const express = require('express');
const { register, login, getMe, logout, googleCallBack} = require('../controllers/auth');

const router = express.Router();
const passport = require('../passport');

const { protect } = require('../middleware/auth');

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Login failed",
    });
});

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login/failed",
    }),
    googleCallBack
);



router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;
