import fs from 'fs';
import path from 'path';
import { UserProfileService } from '../../src/services/index.js';
import { NotFoundError } from '../../src/errors/index.js';

jest.mock('fs');
jest.mock('../../src/repositories/index.js', () => ({
    UserProfileRepository: jest.fn(),
}));

describe('UserProfileService', () => {
    let userProfileService;
    let userProfileRepositoryMock;
    let mockFile;
    let host;

    beforeEach(() => {
        userProfileRepositoryMock = {
            findAndUpdateUserProfileByUserIdAsync: jest.fn(),
        };
        userProfileService = new UserProfileService({
            userProfileRepository: userProfileRepositoryMock,
        });
        mockFile = {
            mimetype: 'image/jpeg',
            buffer: Buffer.from('file content'),
        };
        host = 'http://localhost:3000';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update user profile successfully without avatar', async () => {
        const userId = '123';
        const newUserProfile = { name: 'New Name' };

        userProfileRepositoryMock.findAndUpdateUserProfileByUserIdAsync.mockResolvedValue(
            {
                ...newUserProfile,
                _id: userId,
            },
        );

        await expect(
            userProfileService.updateUserProfileAsync(userId, newUserProfile),
        ).resolves.not.toThrow();

        expect(
            userProfileRepositoryMock.findAndUpdateUserProfileByUserIdAsync,
        ).toHaveBeenCalledWith(userId, newUserProfile);
    });

    it('should update user profile and save avatar if file is provided', async () => {
        const userId = '123';
        const newUserProfile = { name: 'New Name' };
        const username = 'testUser';

        userProfileRepositoryMock.findAndUpdateUserProfileByUserIdAsync.mockResolvedValue(
            {
                ...newUserProfile,
                _id: userId,
            },
        );

        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});
        fs.writeFileSync.mockImplementation(() => {});

        const avatarUrl = await userProfileService.saveAvatarAsync(
            mockFile,
            username,
            host,
        );

        await expect(
            userProfileService.updateUserProfileAsync(
                userId,
                newUserProfile,
                username,
                host,
                mockFile,
            ),
        ).resolves.not.toThrow();

        expect(
            userProfileRepositoryMock.findAndUpdateUserProfileByUserIdAsync,
        ).toHaveBeenCalledWith(userId, {
            ...newUserProfile,
            avatar: avatarUrl,
        });

        expect(fs.existsSync).toHaveBeenCalledWith(
            path.join(process.cwd(), 'resources', 'avatars', username),
        );
        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user profile is not found', async () => {
        const userId = '123';
        const newUserProfile = { name: 'New Name' };

        userProfileRepositoryMock.findAndUpdateUserProfileByUserIdAsync.mockResolvedValue(
            null,
        );

        await expect(
            userProfileService.updateUserProfileAsync(userId, newUserProfile),
        ).rejects.toThrow(NotFoundError);

        expect(
            userProfileRepositoryMock.findAndUpdateUserProfileByUserIdAsync,
        ).toHaveBeenCalledWith(userId, newUserProfile);
    });
});
