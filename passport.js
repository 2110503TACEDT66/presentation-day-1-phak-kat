const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.use(new GoogleStrategy({
    clientID: "285505551320-p7i19arfrb9qcac9vmdmj38hg1ro9qh6.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:5000/api/v1/auth/google/callback",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, callback) => {
    callback(null, profile);
  }
));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;