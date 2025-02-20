import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address.',
        ],
        maxlength: 100,
    },
    userProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProfile',
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
    ],
    refreshToken: { type: String, required: false },
    registrationToken: { type: String, required: false },
    forgotPasswordToken: { type: String, required: false },
    projects: [
        {
            type: String,
        },
    ],
    selectedProjectId: {
        type: String,
        default: null,
    },
});

const User = mongoose.model('User', userSchema);

export default User;
