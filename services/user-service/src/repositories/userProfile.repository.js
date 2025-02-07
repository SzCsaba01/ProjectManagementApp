import { UserProfile } from '../models/index.js';

class UserProfileRepository {
    async createUserProfileAsync(userProfile) {
        return await UserProfile.create(userProfile);
    }

    async updateUserProfileAsync(userProfile) {
        const { _id, ...profileWithoutId } = userProfile;
        return await UserProfile.updateOne(
            { _id: _id },
            { $set: profileWithoutId },
        );
    }

    async findAndUpdateUserProfileByUserIdAsync(userId, newUserProfileData) {
        return await UserProfile.findOneAndUpdate(
            { user: userId },
            newUserProfileData,
            { new: true, runValidators: true },
        );
    }

    async deleteUserProfileByUserIdAsync(userId) {
        await UserProfile.deleteOne({ userId: userId });
    }
}

export default UserProfileRepository;
