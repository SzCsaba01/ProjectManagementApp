import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { RoleRepository } from '../../src/repositories';
import { Role } from '../../src/models/index.js';

describe('RoleRepository', () => {
    let mongoServer;
    let roleRepository;

    // Setup and Teardown
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        roleRepository = new RoleRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Role.deleteMany();
    });

    it('should retrieve a role by name', async () => {
        //Arrange
        const role = await Role.create({ name: 'User', permissions: [] });

        //Act
        const foundRole = await roleRepository.getRoleByRoleNameAsync('User');

        //Assert
        expect(foundRole.name).toBe('User');
    });
});
