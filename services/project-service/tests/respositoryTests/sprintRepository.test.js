import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SprintRepository } from '../../src/repositories/index.js';
import { Sprint } from '../../src/models/index.js';

describe('SprintRepository', () => {
    let mongoServer;
    let sprintRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        sprintRepository = new SprintRepository();
    });

    beforeEach(async () => {
        await Sprint.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    const createTestSprint = async (overrides = {}) => {
        const defaultSprint = {
            name: 'Test Sprint',
            startDate: new Date(),
            plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            project: new mongoose.Types.ObjectId(),
        };
        return await Sprint.create({ ...defaultSprint, ...overrides });
    };

    it('should create a sprint', async () => {
        //Arrange
        const sprintData = {
            name: 'Sprint 1',
            startDate: new Date(),
            plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            project: new mongoose.Types.ObjectId(),
        };

        //Act
        const sprint = await sprintRepository.createSprintAsync(sprintData);

        //Assert
        expect(sprint).toHaveProperty('_id');
        expect(sprint.name).toBe(sprintData.name);
    });

    it('should retrieve a sprint by ID', async () => {
        //Arrange
        const sprint = await createTestSprint({ name: 'Find Sprint' });

        //Act
        const foundSprint = await sprintRepository.getSprintByIdAsync(
            sprint._id,
        );

        //Assert
        expect(foundSprint.name).toBe('Find Sprint');
    });

    it('should retrieve sprints by multiple IDs', async () => {
        //Arrange
        const sprint1 = await createTestSprint({ name: 'Sprint 1' });
        const sprint2 = await createTestSprint({ name: 'Sprint 2' });

        //Act
        const sprints = await sprintRepository.getSprintsByIdsAsync([
            sprint1._id,
            sprint2._id,
        ]);

        //Assert
        expect(sprints.length).toBe(2);
    });

    it('should update a sprint', async () => {
        //Arrange
        const sprint = await createTestSprint({ name: 'Old Sprint' });
        sprint.name = 'Updated Sprint';

        //Act
        const updatedSprint = await sprintRepository.updateSprintAsync(sprint);

        //Assert
        expect(updatedSprint.name).toBe('Updated Sprint');
    });

    it('should delete a sprint by ID', async () => {
        //Arrange
        const sprint = await createTestSprint({ name: 'Delete Me' });

        //Act
        await sprintRepository.deleteSprintByIdAsync(sprint._id);

        //Assert
        const foundSprint = await Sprint.findById(sprint._id);
        expect(foundSprint).toBeNull();
    });
});
