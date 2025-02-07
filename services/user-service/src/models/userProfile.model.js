import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    firstName: {
        type: String,
        required: true,
        maxLength: 50,
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 50,
    },
    avatar: {
        type: String,
        default: null,
    },
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;
