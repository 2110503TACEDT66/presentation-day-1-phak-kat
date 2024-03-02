const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        require: [true, 'Please add  an address']
    },
    district: {
        type: String,
        require: [true, 'Please add district'],
    },
    province: {
        type: String,
        require: [true, 'Please add province']
    },
    tel: {
        type: String
    },
    price: {
        type: BigInt
    },
    capicityPerRoom: {
        type: BigInt
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});


//Cascade delete appointment when a hospital is delete
HotelSchema.pre('deleteOne', {document: true, query:false}, async function(next){
    console.log(`Booking being remove from hotel ${this._id}`);
    await this.model('Booking').deleteMany({hotel: this._id});
    next();
});

//revers populate with virtuals
HotelSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'hotel',
    justOne: false
});



module.exports = mongoose.model('Hotel', HotelSchema);