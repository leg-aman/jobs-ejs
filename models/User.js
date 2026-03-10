const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,    
        required: [true, 'Please add a name'], 
        trim: true,
        minLength: [3, 'Name must be at least 3 characters'],
        maxLength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        trim: true,
        minLength: [3, 'Email must be at least 3 characters'],
        maxLength: [100, 'Email cannot be more than 100 characters'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email',
        ]    
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minLength: [6, 'Password must be at least 6 characters'],        
    }    
})

UserSchema.pre('save', async function (){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
   
});

UserSchema.methods.createJWT = function () {
    return jwt.sign({ userId: this._id, name: this.name }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
  };
  UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  };

module.exports = mongoose.model('User', UserSchema);