import { AuthService } from '../../src/services/index.js';
import {
    UserRepository,
    BlacklistedTokenRepository,
} from '../../src/repositories/index.js';
import { JWTHelper } from '../../src/utils/index.js';
import { ValidationError, NotFoundError } from '../../src/errors/index.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

jest.mock('../../src/repositories/index.js', () => ({
    UserRepository: jest.fn(),
    BlacklistedTokenRepository: jest.fn(),
}));

jest.mock('../../src/utils/index.js');
jest.mock('bcryptjs/dist/bcrypt.js');

describe('AuthService', () => {
    let authService;
    let userRepository;
    let blacklistedTokenRepository;

    beforeEach(() => {
        userRepository = new UserRepository();
        blacklistedTokenRepository = new BlacklistedTokenRepository();
        authService = new AuthService({
            userRepository,
            blacklistedTokenRepository,
        });

        userRepository.getUserByUsernameAsync = jest.fn();
        userRepository.getUserByIdAsync = jest.fn();
        userRepository.getUserByUserIdAndRefreshTokenAsync = jest.fn();
        userRepository.updateUserAsync = jest.fn();

        blacklistedTokenRepository.addTokenAsync = jest.fn();
        blacklistedTokenRepository.isTokenBlacklistedAsync = jest.fn();
        blacklistedTokenRepository.isTokenBlacklistedAsync.mockResolvedValue(
            false,
        );
    });

    describe('loginAsync', () => {
        it('should throw an error if user is not found', async () => {
            userRepository.getUserByUsernameAsync.mockResolvedValue(null);

            const authDTO = { username: 'testuser', password: 'password' };
            await expect(authService.loginAsync(authDTO, {})).rejects.toThrow(
                new ValidationError('Invalid credentials!'),
            );
        });

        it('should throw an error if password does not match', async () => {
            const user = { username: 'testuser', password: 'hashedpassword' };
            userRepository.getUserByUsernameAsync.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(false);

            const authDTO = { username: 'testuser', password: 'wrongpassword' };
            await expect(authService.loginAsync(authDTO, {})).rejects.toThrow(
                new ValidationError('Invalid credentials!'),
            );
        });

        it('should throw an error if email is not verified', async () => {
            const user = {
                username: 'testuser',
                password: 'hashedpassword',
                registrationToken: 'token',
            };
            userRepository.getUserByUsernameAsync.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);

            const authDTO = { username: 'testuser', password: 'password' };
            await expect(authService.loginAsync(authDTO, {})).rejects.toThrow(
                new ValidationError('Email is not verified!'),
            );
        });

        it('should successfully log in and return a LoginResponseDTO', async () => {
            const user = {
                username: 'testuser',
                password: 'hashedpassword',
                registrationToken: null,
                roles: [
                    {
                        name: 'User',
                        permissions: [
                            { resource: 'PROJECT', action: 'CREATE' },
                        ],
                    },
                ],
                userProfile: {
                    firstName: 'John',
                    lastName: 'Doe',
                    avatar: 'avatar.jpg',
                },
            };
            userRepository.getUserByUsernameAsync.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);

            const authDTO = { username: 'testuser', password: 'password' };
            const res = {
                cookie: jest.fn(),
            };

            const loginResponse = await authService.loginAsync(authDTO, res);

            expect(res.cookie).toHaveBeenCalledTimes(2); // Check that both cookies are set
            expect(loginResponse).toHaveProperty('username', 'testuser');
            expect(loginResponse).toHaveProperty('roles');
            expect(loginResponse).toHaveProperty('permissions');
        });
    });

    describe('logout', () => {
        it('should throw NotFoundError if user is not found', async () => {
            const accessToken = 'valid-access-token';
            JWTHelper.verifyJWT.mockReturnValue({ userId: 'userId' });
            userRepository.getUserByIdAsync.mockResolvedValue(null);

            const res = {
                clearCookie: jest.fn(),
            };

            await expect(authService.logout(accessToken, res)).rejects.toThrow(
                new NotFoundError('Something went wrong!'),
            );
        });

        it('should log out the user successfully and blacklist the access token', async () => {
            const accessToken = 'valid-access-token';
            const refreshToken = 'valid-refresh-token';
            const user = { _id: 'userId', refreshToken };
            JWTHelper.verifyJWT.mockReturnValue({ userId: 'userId' });
            userRepository.getUserByIdAsync.mockResolvedValue(user);
            blacklistedTokenRepository.isTokenBlacklistedAsync.mockResolvedValue(
                false,
            );

            const res = {
                clearCookie: jest.fn(),
            };

            await authService.logout(accessToken, res);

            expect(res.clearCookie).toHaveBeenCalledTimes(2);
            expect(
                blacklistedTokenRepository.addTokenAsync,
            ).toHaveBeenCalledWith(accessToken);
        });
    });

    describe('refreshAccessTokenAsync', () => {
        it('should successfully refresh the access token and update the refresh token', async () => {
            const refreshToken = 'valid-refresh-token';
            const user = {
                _id: 'userId',
                roles: [
                    {
                        name: 'User',
                        permissions: [
                            { resource: 'PROJECT', action: 'CREATE' },
                        ],
                    },
                ],
                userProfile: {
                    firstName: 'John',
                    lastName: 'Doe',
                    avatar: 'avatar.jpg',
                },
            };
            JWTHelper.verifyJWT.mockReturnValue({ userId: 'userId' });
            userRepository.getUserByUserIdAndRefreshTokenAsync.mockResolvedValue(
                user,
            );
            blacklistedTokenRepository.isTokenBlacklistedAsync.mockResolvedValue(
                false,
            );
            JWTHelper.createJWT.mockReturnValue('new-refresh-token');
            const res = {
                cookie: jest.fn(),
            };

            await authService.refreshAccessTokenAsync(refreshToken, res);

            expect(res.cookie).toHaveBeenCalledTimes(2); // Check both cookies are set
            expect(userRepository.updateUserAsync).toHaveBeenCalledWith(user);
            expect(
                blacklistedTokenRepository.addTokenAsync,
            ).toHaveBeenCalledWith(refreshToken);
        });
    });
});
