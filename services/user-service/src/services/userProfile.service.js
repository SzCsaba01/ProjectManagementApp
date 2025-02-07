import NotFoundError from '../errors/notFound.error.js';
import fs from 'fs';
import path from 'path';

class UserProfileService {
    constructor({ userProfileRepository }) {
        this.userProfileRepository = userProfileRepository;
    }

    async updateUserProfileAsync(userId, newUserProfile, username, host, file) {
        if (file) {
            newUserProfile.avatar = await this.saveAvatarAsync(
                file,
                username,
                host,
            );
        }
        const updatedUser =
            await this.userProfileRepository.findAndUpdateUserProfileByUserIdAsync(
                userId,
                newUserProfile,
            );

        if (!updatedUser) {
            throw new NotFoundError('User profile not found!');
        }
    }

    async saveAvatarAsync(file, username, host) {
        const uploadRoot = path.join(process.cwd(), 'resources', 'avatars');
        const userFolder = path.join(uploadRoot, username);

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        const mimeType = file.mimetype;
        const extension = mimeType.split('/')[1];

        const filePath = path.join(userFolder, `profile-picture.${extension}`);
        fs.writeFileSync(filePath, file.buffer);

        const avatarUrl = `${host}/resources/avatars/${username}/profile-picture.${extension}`;

        return avatarUrl;
    }
}

export default UserProfileService;
