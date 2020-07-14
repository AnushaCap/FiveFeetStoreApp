const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    phonenumber: {
        type: Number,
        require: true,
        maxlength: 10
    },
    tokens: [{
token: {
    type: String,
    required: true
}
    }]
})

userSchema.methods.generateWebTokens = async function() {
    const user = this;
const token = await jwt.sign({_id: user._id.toString()}, 'thisisawebtoken');

 user.tokens = user.tokens.concat({token});
 
 await user.save();
return token;
}


userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    return userObj;
}




userSchema.statics.findByCredentials = async (email, password) => {
const user = await User.findOne({email});
if (!user) {
    throw new Error('Unable to find one');
} const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
    throw new Error('unable to login');
} return user;
}

userSchema.pre('save', async function(next) {
const user = this;
if (user.isModified('password')) {
user.password = await bcrypt.hash(user.password, 8);
}
next();
})

const User = mongoose.model('user', userSchema);

module.exports = User