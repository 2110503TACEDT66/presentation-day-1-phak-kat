const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
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