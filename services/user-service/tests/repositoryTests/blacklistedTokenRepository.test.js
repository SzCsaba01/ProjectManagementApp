import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BlacklistedTokenRepository } from '../../src/repositories';
import { BlacklistedToken } from '../../src/models/index.js';

describe('BlacklistedTokenRepository', () => {
    let mongoServer;
    let blacklistedTokenRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        blacklistedTokenRepository = new BlacklistedTokenRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await BlacklistedToken.deleteMany();
    });

    it('should add a token to blacklist', async () => {
        //Arrange
        const token = 'blacklisted-token';

        //Act
        await blacklistedTokenRepository.addTokenAsync(token);
        const foundToken =
            await blacklistedTokenRepository.isTokenBlacklistedAsync(token);

        //Assert
        expect(foundToken).toBeDefined();
    });
});
