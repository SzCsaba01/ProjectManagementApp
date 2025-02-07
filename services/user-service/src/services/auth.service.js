import bcrypt from 'bcryptjs/dist/bcrypt.js';
import {
    InvalidTokenError,
    NotFoundError,
    ValidationError,
} from '../errors/index.js';
import LoginResponseDTO from '../dtos/loginResponse.dto.js';
import { JWTHelper } from '../utils/index.js';

class AuthService {
    constructor({ userRepository, blacklistedTokenRepository }) {
        this.userRepository = userRepository;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    async loginAsync(authDTO, res) {
        const user = await this.userRepository.getUserByUsernameAsync(
            authDTO.username,
        );
        if (!user) {
            throw new ValidationError('Invalid credentials!');
        }

        const isMatch = await bcrypt.compare(authDTO.password, user.password);
        if (!isMatch) {
            throw new ValidationError('Invalid credentials!');
        }

        if (user.registrationToken != null) {
            throw new ValidationError('Email is not verified!');
        }

        const userRoles = user.roles.map((role) => role.name);

        const userPermissions = user.roles.flatMap((role) =>
            role.permissions.map((permission) => ({
                resource: permission.resource,
                action: permission.action,
            })),
        );

        const uniquePermissions = [
            ...new Map(
                userPermissions.map((perm) => [
                    `${perm.resource}-${perm.action}`,
                    perm,
                ]),
            ).values(),
        ];
        const accessToken = JWTHelper.createJWT(
            {
                userId: user._id,
                roles: userRoles,
                permissions: uniquePermissions,
            },
            process.env.JWT_SECRET,
            process.env.JWT_EXPIRATION,
        );
        const refreshToken = JWTHelper.createJWT(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            process.env.REFRESH_TOKEN_EXPIRATION,
        );

        user.refreshToken = refreshToken;
        await this.userRepository.updateUserAsync(user);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        return new LoginResponseDTO(
            user._id,
            user.username,
            user.email,
            user.userProfile.firstName,
            user.userProfile.lastName,
            user.userProfile.avatar,
            userRoles,
            uniquePermissions,
        );
    }

    async logout(accessToken, res) {
        const decodedJWT = JWTHelper.verifyJWT(
            accessToken,
            process.env.JWT_SECRET,
        );

        const userId = decodedJWT.userId;

        if (!userId) {
            throw new NotFoundError(
                'Something went wrong! Please try again later!',
            );
        }

        if (!userId) {
            throw new NotFoundError('Something went wrong!');
        }

        const user = await this.userRepository.getUserByIdAsync(userId);

        if (!user) {
            throw new NotFoundError('Something went wrong!');
        }

        user.refreshToken = null;

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        await this.blacklistedTokenRepository.addTokenAsync(accessToken);
        await this.userRepository.updateUserAsync(user);
    }

    async refreshAccessTokenAsync(refreshToken, res) {
        try {
            if (!refreshToken) {
                res.clearCookie('accessToken');
                return;
            }

            let decoded = undefined;
            try {
                decoded = JWTHelper.verifyJWT(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                );
            } catch (error) {
                throw new InvalidTokenError(
                    'You session has expired please login again!',
                );
            }

            const userId = decoded.userId;

            if (!userId) {
                throw new NotFoundError(
                    'Something went wrong! Please try again later!',
                );
            }

            const user =
                await this.userRepository.getUserByUserIdAndRefreshTokenAsync(
                    userId,
                    refreshToken,
                );

            if (!user) {
                throw new NotFoundError(
                    'Something went wrong! Please try again later!',
                );
            }

            const blacklistedToken =
                await this.blacklistedTokenRepository.isTokenBlacklistedAsync(
                    refreshToken,
                );

            if (blacklistedToken) {
                throw new NotFoundError(
                    'Something went wrong! Please try again later!',
                );
            }

            await this.blacklistedTokenRepository.addTokenAsync(refreshToken);

            const newRefreshToken = JWTHelper.createJWT(
                { userId: user._id },
                process.env.REFRESH_TOKEN_SECRET,
                process.env.REFRESH_TOKEN_EXPIRATION,
            );

            user.refreshToken = newRefreshToken;
            await this.userRepository.updateUserAsync(user);

            const userRoles = user.roles.map((role) => role.name);

            const userPermissions = user.roles.flatMap((role) =>
                role.permissions.map((permission) => ({
                    resource: permission.resource,
                    action: permission.action,
                })),
            );

            const uniquePermissions = [
                ...new Map(
                    userPermissions.map((perm) => [
                        `${perm.resource}-${perm.action}`,
                        perm,
                    ]),
                ).values(),
            ];

            const newAccessToken = JWTHelper.createJWT(
                {
                    userId: user._id,
                    roles: userRoles,
                    permissions: uniquePermissions,
                },
                process.env.JWT_SECRET,
                process.env.JWT_EXPIRATION,
            );

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
            });

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
            });
        } catch (error) {
            console.error(error);
        }
    }
}

export default AuthService;
