const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

//@desc    Get all bookings
//@route   GET /api/v1/bookings
//@access  Public
exports.getBookings = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin'){
        query = Booking.find({user: req.user.id}).populate({
            path: 'hotel',
            select: 'name province tel'
        });
    } else {
        if (req.params.hotelId){
            console.log(req.params.hotelId);
            query = Booking.find({hotel: req.params.hotelId}).populate({
                path: 'hotel',
                select: "name province tel"
            });
        } else {
            query = Booking.find().populate({
                path: 'hotel',
                select: 'name province tel'
            });
        }
    }
    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        })
    } catch (error) {
        console.log('error');

        return res.status(500).json({
            success: false,
            message: "Cannot find Booking"
        });
    }

};

//@desc     Get one Booking
//@route    GET /api/v1/bookings/:id
//@access   Private
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'hotel',
            select: 'name description tel'
        });

        if (!booking){
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});    
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to get this booking`
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            success: true, 
            message: "Cannot find Booking"
        });
    }
};

//@desc     Add Booking
//@route    POST /api/v1/holtel/:hotelId/booking
//@access   Public
exports.addBooking = async (req, res, next) => {
    try {
        req.body.hotel = req.params.hotelId;

        const hotel = await Hotel.findById(req.params.hotelId);

        if (!hotel) {
            return res.status(404).json({
                success: false, 
                message: `No hotel with the id of ${req.params.hotelId}`
            });
        }

        //add user Id to req.body
        req.body.user = req.user.id;

        //check exsited appt
        const exsitedBookings = await Booking.find({user: req.user.id});

        //max 3 bookings per user
        if(exsitedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 bookings`
            });
        }
        
        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log('error');
        return res.status(500).json({
            success: false,
            message: "Cannot create Booking"
        });
    }
};

//@desc     Update Booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking){
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        //make sure user is booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log('error');
        return res.status(500).json({
            success: false,
            message: "Cannot update Booking"
        });
    }
};  

//@desc     Delete Booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking){
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }
        
        //make sure user is booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Booking"
        });
    }
};
