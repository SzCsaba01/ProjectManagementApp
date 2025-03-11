import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Permission, Role, User, UserProfile } from '../../src/models/index.js';
import { UserRepository } from '../../src/repositories';
import { ACTIONS, RESOURCES } from '../../src/utils/index.js';

describe('UserRepository', () => {
    let mongoServer;
    let userRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        userRepository = new UserRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany();
        await Role.deleteMany();
        await Permission.deleteMany();
        await UserProfile.deleteMany();
    });

    const createMockPermission = async () => {
        return await Permission.create({
            resource: RESOURCES.PROJECT,
            action: ACTIONS.CREATE,
        });
    };

    const createMockRole = async (permissions) => {
        return await Role.create({
            name: 'User',
            permissions: permissions,
        });
    };

    const createMockUserProfile = async () => {
        return await UserProfile.create({ firstName: 'John', lastName: 'Doe' });
    };

    const createMockUser = async () => {
        const permission = await createMockPermission();
        const role = await createMockRole([permission._id]);
        const userProfile = await createMockUserProfile();

        return await User.create({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            roles: [role._id],
            userProfile: userProfile._id,
        });
    };

    it('should create a user with roles, permissions, and profile', async () => {
        // Arrange

        // Act
        const user = await createMockUser();

        // Assert
        expect(user).toHaveProperty('username', 'testuser');
        expect(user).toHaveProperty('email', 'testuser@example.com');
    });

    it('should retrieve a user by username', async () => {
        // Arrange
        const user = await createMockUser();

        // Act
        const foundUser = await userRepository.getUserByUsernameAsync(
            user.username,
        );

        // Assert
        expect(foundUser).toBeDefined();
        expect(foundUser.username).toBe(user.username);
    });

    it('should retrieve a user by email', async () => {
        // Arrange
        const user = await createMockUser();

        // Act
        const foundUser = await userRepository.getUserByEmailAsync(user.email);

        // Assert
        expect(foundUser).toBeDefined();
        expect(foundUser.email).toBe(user.email);
    });

    it('should retrieve a user by username or email', async () => {
        // Arrange
        const user = await createMockUser();

        // Act
        const foundByUsername =
            await userRepository.getUserByUsernameOrEmailAsync(user.username);
        const foundByEmail = await userRepository.getUserByUsernameOrEmailAsync(
            user.email,
        );

        // Assert
        expect(foundByUsername.email).toBe(user.email);
        expect(foundByEmail.username).toBe(user.username);
    });

    it('should retrieve users by role', async () => {
        // Arrange
        await createMockUser();

        // Act
        const users = await userRepository.getUsersByRole('User');

        // Assert
        expect(users).toHaveLength(1);
        expect(users[0].roles[0].name).toBe('User');
    });

    it('should paginate users', async () => {
        // Arrange
        await createMockUser();

        // Act
        const result = await userRepository.getUsersPaginatedAsync(
            'test',
            1,
            1,
        );

        // Assert
        expect(result.users.length).toBeGreaterThan(0);
        expect(result.totalNumberOfUsers).toBeGreaterThan(0);
    });

    it('should update a user', async () => {
        // Arrange
        const user = await createMockUser();
        user.email = 'updatedemail@example.com';

        // Act
        await userRepository.updateUserAsync(user);
        const updatedUser = await userRepository.getUserByIdAsync(user._id);

        // Assert
        expect(updatedUser.email).toBe('updatedemail@example.com');
    });

    it('should delete a user', async () => {
        // Arrange
        const user = await createMockUser();
        const userId = user._id;

        // Act
        await userRepository.deleteUserByIdAsync(userId);
        const deletedUser = await userRepository.getUserByIdAsync(userId);

        // Assert
        expect(deletedUser).toBeNull();
    });
});
