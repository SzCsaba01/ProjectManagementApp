import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ProjectRepository } from '../../src/repositories/index.js';
import { Project } from '../../src/models/index.js';

describe('ProjectRepository', () => {
    let mongoServer;
    let projectRepository;

    const createTestProject = async (overrides = {}) => {
        const defaultProject = {
            name: 'Test Project',
            ownerId: '123',
            userIds: ['123', '456'],
        };
        return await Project.create({ ...defaultProject, ...overrides });
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        projectRepository = new ProjectRepository();
    });

    beforeEach(async () => {
        await Project.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should create a project', async () => {
        //Arrange
        const projectData = {
            name: 'Test Project',
            ownerId: '123',
            userIds: ['123', '456'],
        };

        //Act
        const project = await projectRepository.createProjectAsync(projectData);

        //Assert
        expect(project).toHaveProperty('_id');
        expect(project.name).toBe(projectData.name);
    });

    it('should retrieve all projects', async () => {
        //Arrange
        await createTestProject({ name: 'Project 1' });
        await createTestProject({ name: 'Project 2' });

        //Act
        const projects = await projectRepository.getAllProjectsAsync();

        //Assert
        expect(projects.length).toBe(2);
    });

    it('should retrieve a project by ID', async () => {
        //Arrange
        const project = await createTestProject({ name: 'Find Me' });

        //Act
        const foundProject = await projectRepository.getProjectByProjectIdAsync(
            project._id,
        );

        //Assert
        expect(foundProject.name).toBe('Find Me');
    });

    it('should retrieve projects by member ID', async () => {
        //Arrange
        await createTestProject({ name: 'Project 1', userIds: ['456'] });
        await createTestProject({ name: 'Project 2', userIds: ['456'] });

        //Act
        const projects =
            await projectRepository.getProjectsByMemberIdAsync('456');

        //Assert
        expect(projects.length).toBe(2);
    });

    it('should retrieve projects by owner ID', async () => {
        //Arrange
        await createTestProject({ name: 'Owned Project', ownerId: '123' });

        //Act
        const projects =
            await projectRepository.getProjectsByOwnerIdAsync('123');

        //Assert
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Owned Project');
    });

    it('should update a project', async () => {
        //Arrange
        const project = await createTestProject({ name: 'Old Name' });
        project.name = 'New Name';

        //Act
        const updatedProject =
            await projectRepository.updateProjectAsync(project);

        //Assert
        expect(updatedProject.name).toBe('New Name');
    });

    it('should delete a project by ID', async () => {
        //Arrange
        const project = await createTestProject({ name: 'To Be Deleted' });

        //Act
        await projectRepository.deleteProjectByProjectIdAsync(project._id);

        //Assert
        const foundProject = await Project.findById(project._id);
        expect(foundProject).toBeNull();
    });
});
