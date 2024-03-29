const User = require('../models/User');
const bcrypt = require('bcryptjs');

//@desc    Register user
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req, res, next) => {
    try {
        const {name, email, password, role} = req.body;
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        //const token = user.getSignedJwtToken();
        //res.status(200).json({success: true, token});
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({success: false});
        console.log(err.stack);
    }
}

//@desc    Login user
//@route   POST /api/v1/auth/login
//@access  Public
exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    //validate
    if (!email || !password){
        return res.status(400).json({success: false, msg: 'Please provide an email and password'});
    }
    
    //check user
    const user = await User.findOne({email}).select('+password');
    if (!user){
        return res.status(400).json({success: false, msg: 'Invalid credentials No user'});
    }

    //check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch){
        return res.status(401).json({success: false, msg: 'Invalid credentials Wrong password'});
    }

    //create token
    //const token = user.getSignedJwtToken();
    //res.status(200).json({success: true, token});
    sendTokenResponse(user, 200, res);
}

const sendTokenResponse = (user, statusCode, res) => {
    //create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production'){
        options.secure = true;
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}

//@desc    Get current logged user
//@route   GET /api/v1/auth/me
//@access  Private
exports.getMe = async(req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
};

//@desc    Logout user
//@route   GET /api/v1/auth/logout
//@access  Private
exports.logout = async(req,res,next) => {
    res.cookie('token','none',{
        expires: new Date(Date.now()+ 10*1000),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        data: {},
        msg: "Logout Successfully"
    });
}

exports.googleCallBack = async (req, res) => {
    try {
        const { id, name, emails } = req.user;
    
        const givenName = name?.givenName || '';
        const familyName = name?.familyName || '';
    
        let user = await User.findOne({ googleId: id });
        
        if (user) {
            const token = user.getSignedJwtToken();

            const options = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
                httpOnly: true
            };

            if (process.env.NODE_ENV === 'production'){
                options.secure = true;
            }

            return res.cookie('token', token, options).redirect('/');
        }
    
        user = await User.findOne({ email: emails[0].value });
    
        if (user) {
            return res.redirect('/');
        }
    
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
        user = await User.create({ name: `${givenName} ${familyName}`, email: emails[0].value, googleId: id, password: hashedPassword });
        
        const token = user.getSignedJwtToken();

        const options = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
            httpOnly: true
        };

        if (process.env.NODE_ENV === 'production'){
            options.secure = true;
        }

        return res.cookie('token', token, options).redirect('/');
    } catch (err) {
        console.error('Error handling Google callback:', err);
        res.redirect("/google");
    }    
}