import { NotFoundError, ValidationError } from '../../src/errors/index.js';
import { JWTHelper } from '../../src/utils/index.js';
import { publishUserEventToTopicAsync } from '../../src/kafka/index.js';
import UserService from '../../src/services/user.service.js';

jest.mock('../../src/repositories/index.js', () => ({
    UserProfileRepository: jest.fn(),
    UserRepository: jest.fn(),
    RoleRepository: jest.fn(),
    BlacklistedTokenRepository: jest.fn(),
}));

jest.mock('../../src/services/index.js', () => ({
    EmailService: jest.fn(),
}));
jest.mock('bcryptjs/dist/bcrypt.js');
jest.mock('../../src/kafka/index.js');

process.env.JWT_SECRET = 'test-secret-key';

describe('UserService', () => {
    let userService;
    let userRepositoryMock;
    let userProfileRepositoryMock;
    let roleRepositoryMock;
    let blacklistedTokenRepositoryMock;
    let emailServiceMock;

    beforeEach(() => {
        userRepositoryMock = {
            getUserByUsernameOrEmailAsync: jest.fn(),
            getUserByIdAsync: jest.fn(),
            getUsersByRole: jest.fn(),
            createUserAsync: jest.fn(),
            updateUserAsync: jest.fn(),
            deleteUserByIdAsync: jest.fn(),
            getUserByEmailAsync: jest.fn(),
            getUsersByIdsAsync: jest.fn(),
            getUsersBySelectedProjectIdAsync: jest.fn(),
            getUsersPaginatedAsync: jest.fn(),
            getUserByUsernameAndRegistrationTokenAsync: jest.fn(),
        };

        userProfileRepositoryMock = {
            createUserProfileAsync: jest.fn(),
            updateUserProfileAsync: jest.fn(),
            deleteUserProfileByUserIdAsync: jest.fn(),
        };

        roleRepositoryMock = {
            getRoleByRoleNameAsync: jest.fn(),
        };

        blacklistedTokenRepositoryMock = {
            deleteExpiredTokensAsync: jest.fn(),
        };

        emailServiceMock = {
            sendEmailAsync: jest.fn(),
            createRegistrationEmailBody: jest.fn(),
            createForgotPasswordEmailBody: jest.fn(),
        };

        userService = new UserService({
            userRepository: userRepositoryMock,
            userProfileRepository: userProfileRepositoryMock,
            roleRepository: roleRepositoryMock,
            blacklistedTokenRepository: blacklistedTokenRepositoryMock,
            emailService: emailServiceMock,
        });

        JWTHelper.createJWT = jest.fn().mockReturnValue('someJWTToken');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createMockUser = (userData = {}) => ({
        username: userData.username || 'testuser',
        email: userData.email || 'testuser@example.com',
        password: userData.password || 'password123',
        firstName: userData.firstName || 'John',
        lastName: userData.lastName || 'Doe',
        validate: jest.fn(),
    });

    it('should throw ValidationError when username already exists', async () => {
        // Arrange
        const registerDTO = createMockUser({ username: 'existinguser' });
        userRepositoryMock.getUserByUsernameOrEmailAsync.mockResolvedValue({
            username: 'existinguser',
        });

        // Act & Assert
        await expect(userService.registerAsync(registerDTO)).rejects.toThrow(
            ValidationError,
        );
    });

    it('should throw NotFoundError when role not found during registration', async () => {
        // Arrange
        const registerDTO = createMockUser();
        userRepositoryMock.getUserByUsernameOrEmailAsync.mockResolvedValue(
            null,
        );
        roleRepositoryMock.getRoleByRoleNameAsync.mockResolvedValue(null);

        // Act & Assert
        await expect(userService.registerAsync(registerDTO)).rejects.toThrow(
            NotFoundError,
        );
    });

    it('should get managers', async () => {
        // Arrange
        const managers = [
            {
                _id: '1',
                email: 'manager1@example.com',
                userProfile: { firstName: 'John', lastName: 'Doe', avatar: '' },
            },
            {
                _id: '2',
                email: 'manager2@example.com',
                userProfile: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    avatar: '',
                },
            },
        ];

        userRepositoryMock.getUsersByRole.mockResolvedValue(managers);

        // Act
        const result = await userService.getManagersAsync();

        // Assert
        expect(result).toEqual([
            {
                userId: '1',
                email: 'manager1@example.com',
                firstName: 'John',
                lastName: 'Doe',
                avatar: '',
            },
            {
                userId: '2',
                email: 'manager2@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                avatar: '',
            },
        ]);
    });

    it('should send forgot password email', async () => {
        // Arrange
        const email = 'testuser@example.com';
        const user = { _id: 'userId', email: email, forgotPasswordToken: null };

        userRepositoryMock.getUserByEmailAsync.mockResolvedValue(user);

        const forgotPasswordLink =
            'http://frontend.com/change-password?token=someJWTToken';
        JWTHelper.createJWT = jest.fn().mockReturnValue('someJWTToken');
        emailServiceMock.createForgotPasswordEmailBody.mockReturnValue(
            'emailBody',
        );

        // Act
        await userService.sendForgotPasswordEmailAsync(email);

        // Assert
        expect(userRepositoryMock.updateUserAsync).toHaveBeenCalledWith({
            ...user,
            forgotPasswordToken: 'someJWTToken',
        });
        expect(emailServiceMock.sendEmailAsync).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user does not exist during forgot password', async () => {
        // Arrange
        const email = 'nonexistentuser@example.com';

        userRepositoryMock.getUserByEmailAsync.mockResolvedValue(null);

        // Act & Assert
        await expect(
            userService.sendForgotPasswordEmailAsync(email),
        ).resolves.toBeUndefined();
    });

    it('should delete a user successfully', async () => {
        // Arrange
        const userId = 'userId';
        const messageData = { userId };

        // Act
        await userService.deleteUserAsync(userId);

        // Assert
        expect(publishUserEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_DELETE_USER_TOPIC,
            messageData,
        );
        expect(userRepositoryMock.deleteUserByIdAsync).toHaveBeenCalledWith(
            userId,
        );
        expect(
            userProfileRepositoryMock.deleteUserProfileByUserIdAsync,
        ).toHaveBeenCalledWith(userId);
    });
});
