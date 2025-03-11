import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserProfileRepository } from '../../src/repositories';
import { UserProfile } from '../../src/models/index.js';

describe('UserProfileRepository', () => {
    let mongoServer;
    let userProfileRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        userProfileRepository = new UserProfileRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await UserProfile.deleteMany();
    });

    it('should create a user profile', async () => {
        //Arrange
        //Act
        const profile = await userProfileRepository.createUserProfileAsync({
            firstName: 'John',
            lastName: 'Doe',
        });

        //Assert
        expect(profile.firstName).toBe('John');
        expect(profile.lastName).toBe('Doe');
    });
});
