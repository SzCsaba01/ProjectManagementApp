import { UserProfileDTO } from '../dtos/index.js';

class UserProfileController {
    constructor({ userProfileService }) {
        this.userProfileService = userProfileService;
    }

    async updateUserProfile(req, res, next) {
        try {
            const newUserProfileData = new UserProfileDTO(
                ...Object.values(req.body),
            );

            const userId = req.body.userId;
            const username = req.body.username;

            let host = undefined;

            if (req.file) {
                host = `${req.protocol}://${req.get('host')}`;
            }

            await this.userProfileService.updateUserProfileAsync(
                userId,
                newUserProfileData,
                username,
                host,
                req.file,
            );

            res.status(200).json({
                message: 'Successfully updated the user profile!',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default UserProfileController;
