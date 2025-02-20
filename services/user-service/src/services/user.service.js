import { EmailDTO, LoginResponseDTO } from '../dtos/index.js';
import { NotFoundError, ValidationError } from '../errors/index.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';
import {
    USER_ROLE,
    JWTHelper,
    MANAGER_ROLE,
    ADMIN_ROLE,
} from '../utils/index.js';
import { publishUserEventToTopicAsync } from '../kafka/index.js';

class UserService {
    constructor({
        userRepository,
        userProfileRepository,
        roleRepository,
        blacklistedTokenRepository,
        emailService,
    }) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.roleRepository = roleRepository;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.emailService = emailService;
    }

    async registerAsync(registerDTO) {
        registerDTO.validate();

        const existingUserByUsername =
            await this.userRepository.getUserByUsernameOrEmailAsync(
                registerDTO.username,
            );

        if (existingUserByUsername != null) {
            throw new ValidationError('Username already exists!');
        }

        const existingUserByEmail =
            await this.userRepository.getUserByUsernameOrEmailAsync(
                registerDTO.email,
            );

        if (existingUserByEmail != null) {
            throw new ValidationError('Email already exists!');
        }

        const userProfile = {
            firstName: registerDTO.firstName,
            lastName: registerDTO.lastName,
        };

        const newUserProfile =
            await this.userProfileRepository.createUserProfileAsync(
                userProfile,
            );

        const hashedPassword = await bcrypt.hash(registerDTO.password, 10);

        const role =
            await this.roleRepository.getRoleByRoleNameAsync(USER_ROLE);

        if (!role) {
            throw new NotFoundError(
                'Something went wrong! Please try again later',
            );
        }

        const registrationToken = JWTHelper.createJWT(
            { username: registerDTO.username },
            process.env.REGISTRATION_JWT_SECRET,
            process.env.REGISTRATION_TOKEN_EXPIRATION,
        );

        const newUser = {
            username: registerDTO.username,
            email: registerDTO.email,
            password: hashedPassword,
            roles: role,
            registrationToken: registrationToken,
            userProfile: newUserProfile._id,
        };

        const createdUser = await this.userRepository.createUserAsync(newUser);

        newUserProfile.user = createdUser._id;
        await this.userProfileRepository.updateUserProfileAsync(newUserProfile);

        const confirmationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${createdUser.registrationToken}`;
        const email = new EmailDTO(
            createdUser.email,
            'Project Management - Verify Email',
            this.emailService.createRegistrationEmailBody(
                createdUser.username,
                confirmationUrl,
            ),
        );

        // await this.emailService.sendEmailAsync(email);
    }

    async getManagersAsync() {
        const managers = await this.userRepository.getUsersByRole(MANAGER_ROLE);

        const mappedManagers = managers.map((manager) => {
            return {
                userId: manager._id,
                email: manager.email,
                firstName: manager.userProfile.firstName,
                lastName: manager.userProfile.lastName,
                avatar: manager.userProfile.avatar,
            };
        });

        return mappedManagers;
    }

    async getAllUsersForProjectAsync() {
        const users = await this.userRepository.getUsersByRole(USER_ROLE);

        const mappedUsers = users.map((user) => {
            return {
                userId: user._id,
                firstName: user.userProfile.firstName,
                lastName: user.userProfile.lastName,
                avatar: user.userProfile.avatar,
            };
        });

        return mappedUsers;
    }

    async getUserDataAsync(accessToken) {
        let decoded = undefined;
        let user = undefined;
        let uniquePermissions = undefined;
        let userRoles = undefined;

        try {
            decoded = JWTHelper.verifyJWT(accessToken, process.env.JWT_SECRET);
            const userId = decoded.userId;
            user = await this.userRepository.getUserByIdAsync(userId);

            userRoles = user.roles.map((role) => role.name);

            const userPermissions = user.roles.flatMap((role) =>
                role.permissions.map((permission) => ({
                    resource: permission.resource,
                    action: permission.action,
                })),
            );

            uniquePermissions = [
                ...new Map(
                    userPermissions.map((perm) => [
                        `${perm.resource}-${perm.action}`,
                        perm,
                    ]),
                ).values(),
            ];
        } catch (error) {
            throw new InvalidTokenError(
                'Your session has expired please login again!',
            );
        }

        return new LoginResponseDTO(
            user._id,
            user.username,
            user.email,
            user.userProfile.firstName,
            user.userProfile.lastName,
            user.userProfile.avatar,
            userRoles,
            uniquePermissions,
            user.selectedProjectId,
        );
    }

    async getUsersPaginatedAsync(search, page, numberOfUsers) {
        const result = await this.userRepository.getUsersPaginatedAsync(
            search,
            page,
            numberOfUsers,
        );

        result.users = result.users.map((user) => {
            return {
                userId: user._id,
                username: user.username,
                email: user.email,
                firstName: user.userProfile.firstName,
                lastName: user.userProfile.lastName,
                avatar: user.userProfile.avatar,
                roles: user.roles.map((role) => role.name),
            };
        });

        return result;
    }

    async getUsersByProjectIdAsync(projectId) {
        const users =
            await this.userRepository.getUsersByProjectIdAsync(projectId);

        const mappedUsers = users.map((user) => {
            return {
                userId: user._id,
                email: user.email,
                username: user.username,
                firstName: user.userProfile.firstName,
                lastName: user.userProfile.lastName,
                avatar: user.userProfile.avatar,
                roles: user.roles.map((role) => role.name),
            };
        });

        const ownerIndex = mappedUsers.findIndex((user) =>
            user.roles.includes(MANAGER_ROLE),
        );

        if (ownerIndex === -1) {
            throw new NotFoundError('Project owner not found!');
        }

        const owner = mappedUsers.splice(ownerIndex, 1)[0];

        return {
            users: mappedUsers,
            owner: owner,
        };
    }

    async sendForgotPasswordEmailAsync(email) {
        const user = await this.userRepository.getUserByEmailAsync(email);

        if (!user) {
            return;
        }

        user.forgotPasswordToken = JWTHelper.createJWT(
            { userId: user._id },
            process.env.FORGOT_PASSWORD_JWT_SECRET,
            process.env.FORGOT_PASSWORD_TOKEN_EXPIRATION,
        );

        await this.userRepository.updateUserAsync(user);

        const forgotPasswordLink = `${process.env.FRONTEND_URL}/change-password?token=${user.forgotPasswordToken}`;
        const emailDto = new EmailDTO(
            user.email,
            'Project Management - Change Password',
            this.emailService.createForgotPasswordEmailBody(
                user.username,
                forgotPasswordLink,
            ),
        );

        await this.emailService.sendEmailAsync(emailDto);
    }

    async changePasswordAsync(changePasswordDTO) {
        changePasswordDTO.validate();

        const decodedJWT = JWTHelper.verifyJWT(
            changePasswordDTO.forgotPasswordToken,
            process.env.FORGOT_PASSWORD_JWT_SECRET,
        );

        const userId = decodedJWT.userId;

        if (!userId) {
            throw new Error('Something went wrong! Please try again later!');
        }

        const user = await this.userRepository.getUserByIdAsync(userId);

        if (!user) {
            throw new Error('Something went wrong! Please try again later!');
        }

        user.password = await bcrypt.hash(changePasswordDTO.newPassword, 10);
        user.updatedAt = Date.now();
        await this.userRepository.updateUserAsync(user);
    }

    async verifyEmailByRegistrationTokenAsync(registrationToken) {
        const decodedJWT = JWTHelper.verifyJWT(
            registrationToken,
            process.env.REGISTRATION_JWT_SECRET,
        );
        const username = decodedJWT.username;

        if (!username) {
            throw new NotFoundError(
                'Something went wrong! Please try again later!',
            );
        }

        const user =
            await this.userRepository.getUserByUsernameAndRegistrationTokenAsync(
                username,
                registrationToken,
            );

        if (!user) {
            throw new NotFoundError('User not found!');
        }

        user.registrationToken = null;
        user.updatedAt = Date.now();

        await this.userRepository.updateUserAsync(user);
    }

    async verifyIfUserExistsByForgotPasswordTokenAsync(forgotPasswordToken) {
        const decodedJWT = JWTHelper.verifyJWT(
            forgotPasswordToken,
            process.env.FORGOT_PASSWORD_JWT_SECRET,
        );

        const userId = decodedJWT.userId;

        const user = await this.userRepository.getUserByIdAsync(userId);
        if (!user) {
            throw new NotFoundError('User not found!');
        }
    }

    async addUsersToProjectAsync(usersData) {
        const users = await this.userRepository.getUsersByIdsAsync(
            usersData.userIds,
        );

        if (!users) {
            throw NotFoundError('No user were found!');
        }

        users.forEach((user) => {
            user.projects.push(usersData.projectId);
            user.updatedAt = Date.now;
        });

        await this.userRepository.updateUsersAsync(users);
    }

    async removeUsersFromProjectAsync(usersData) {
        let users = await this.userRepository.getUsersByIdsAsync(
            usersData.userIds,
        );
        const selectedProjectUsers =
            await this.userRepository.getUsersBySelectedProjectIdAsync(
                usersData.projectId,
            );

        if (selectedProjectUsers && selectedProjectUsers.length > 0) {
            users = [...users, ...selectedProjectUsers];
        }

        if (!users) {
            throw NotFoundError('No user were found!');
        }

        users.forEach((user) => {
            user.projects = user.projects.filter(
                (projectId) => projectId !== usersData.projectId,
            );
            if (user.selectedProjectId === usersData.projectId) {
                user.selectedProjectId = null;
            }
        });

        await this.userRepository.updateUsersAsync(users);
    }

    async setSelectedProjectAsync(data) {
        const user = await this.userRepository.getUserByIdAsync(data.userId);

        if (!user) {
            throw new NotFoundError('User not found!');
        }

        if (
            !user.projects.includes(data.projectId) &&
            !user.roles.some((role) => role.name === ADMIN_ROLE)
        ) {
            throw new NotFoundError('You are not in the selected project!');
        }

        user.selectedProjectId = data.projectId;

        await this.userRepository.updateUserAsync(user);
    }

    async deleteUserAsync(userId) {
        const messageData = {
            userId: userId,
        };

        await publishUserEventToTopicAsync(
            process.env.KAFKA_DELETE_USER_TOPIC,
            messageData,
        );

        await this.userRepository.deleteUserByIdAsync(userId);
        await this.userProfileRepository.deleteUserProfileByUserIdAsync(userId);
    }

    async deleteExpiredBlacklistedTokensAsync() {
        await this.blacklistedTokenRepository.deleteExpiredTokensAsync();
    }
}

export default UserService;
