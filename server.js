const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const passportSetup = require('./passport');
const session = require('express-session');

const app = express();

dotenv.config({ path: './config/config.env' });

app.use(session({
    secret: "blackCat",
    resave: false,
    saveUninitialized: false
}));

app.use(passportSetup.initialize());
app.use(passportSetup.session());

const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000,
    max: 1000
});

connectDB();

const hotels = require('./routes/hotels');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');

app.use(express.json());
app.use(hpp());
app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/auth', auth);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});