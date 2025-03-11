import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BacklogRepository } from '../../src/repositories/index.js';
import { Backlog } from '../../src/models/index.js';

describe('BacklogRepository', () => {
    let backlogRepository;
    let mongoServer;
    let connection;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        connection = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        backlogRepository = new BacklogRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    const createTestBacklog = async (overrides = {}) => {
        const defaultBacklog = {
            project: new mongoose.Types.ObjectId(),
        };
        return await Backlog.create({ ...defaultBacklog, ...overrides });
    };

    it('should create a backlog', async () => {
        //Arrange
        const backlog = await createTestBacklog();

        //Act
        expect(backlog).toHaveProperty('_id');

        //Assert
        expect(backlog).toHaveProperty('project');
    });

    it('should get a backlog by ID', async () => {
        //Arrange
        const backlog = await createTestBacklog();

        //Act
        const fetchedBacklog = await backlogRepository.getBacklogByBacklogId(
            backlog._id,
        );

        //Assert
        expect(fetchedBacklog).not.toBeNull();
        expect(fetchedBacklog._id.toString()).toBe(backlog._id.toString());
    });

    it('should delete a backlog by ID', async () => {
        //Arrange
        const backlog = await createTestBacklog();

        //Act
        await backlogRepository.deleteBacklogByIdAsync(backlog._id);

        //Assert
        const deletedBacklog = await backlogRepository.getBacklogByBacklogId(
            backlog._id,
        );
        expect(deletedBacklog).toBeNull();
    });
});
