import { ProjectService } from '../../src/services/index.js';
import { publishProjectEventToTopicAsync } from '../../src/kafka/index.js';
import {
    BacklogRepository,
    ProjectRedisRepository,
    ProjectRepository,
    SprintRedisRepository,
    SprintRepository,
} from '../../src/repositories/index.js';

jest.mock('../../src/repositories/index.js', () => ({
    ProjectRepository: jest.fn(),
    ProjectRedisRepository: jest.fn(),
    BacklogRepository: jest.fn(),
    SprintRepository: jest.fn(),
    SprintRedisRepository: jest.fn(),
}));

jest.mock('../../src/kafka/index.js');

describe('ProjectService', () => {
    let projectService;
    let mockProjectRepository;
    let mockProjectRedisRepository;
    let mockBacklogRepository;
    let mockSprintRepository;

    beforeEach(() => {
        mockProjectRepository = {
            createProjectAsync: jest.fn(),
            getAllProjectsAsync: jest.fn(),
            getProjectByProjectIdAsync: jest.fn(),
            updateProjectAsync: jest.fn(),
            updateProjectsAsync: jest.fn(),
            deleteProjectByProjectIdAsync: jest.fn(),
            getProjectsByOwnerIdAsync: jest.fn(),
            getProjectsByMemberIdAsync: jest.fn(),
            getOtherOwnerIdAsync: jest.fn(),
        };

        mockProjectRedisRepository = {
            getProjectByIdAsync: jest.fn(),
            cacheProjectAsync: jest.fn(),
            updateProjectAsync: jest.fn(),
            updateProjectsAsync: jest.fn(),
            deleteProjectByIdAsync: jest.fn(),
            createBacklogAsync: jest.fn(),
            deleteBacklogByIdAsync: jest.fn(),
            deleteSprintsByIdsAsync: jest.fn(),
        };

        mockSprintRepository = {
            deleteSprintsByIdsAsync: jest.fn(),
        };

        mockBacklogRepository = {
            createBacklogAsync: jest.fn(),
            deleteBacklogByIdAsync: jest.fn(),
        };

        projectService = new ProjectService({
            projectRepository: mockProjectRepository,
            projectRedisRepository: mockProjectRedisRepository,
            backlogRepository: mockBacklogRepository,
            sprintRepository: mockSprintRepository,
        });
    });

    it('should create a project and trigger relevant Kafka events', async () => {
        //Arrange
        const newProjectData = {
            name: 'Test Project',
            ownerId: 'owner123',
            userIds: ['user1', 'user2'],
        };

        const createdProject = { _id: 'project123', ...newProjectData };
        const backlog = { _id: 'backlog123' };

        mockProjectRepository.createProjectAsync.mockResolvedValue(
            createdProject,
        );
        mockBacklogRepository.createBacklogAsync.mockResolvedValue(backlog);
        mockProjectRepository.updateProjectAsync.mockResolvedValue(
            createdProject,
        );

        //Act
        await projectService.createProjectAsync(newProjectData);

        //Assert
        expect(mockProjectRepository.createProjectAsync).toHaveBeenCalledWith(
            newProjectData,
        );
        expect(mockBacklogRepository.createBacklogAsync).toHaveBeenCalledWith({
            project: createdProject._id,
        });
        expect(mockProjectRepository.updateProjectAsync).toHaveBeenCalledWith({
            ...createdProject,
            backlog: backlog._id,
        });
        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
            expect.objectContaining({
                userIds: [newProjectData.ownerId, ...newProjectData.userIds],
                projectId: createdProject._id,
            }),
        );
    });

    it('should get all projects', async () => {
        //Arrange
        const projects = [
            { _id: 'project123', name: 'Test Project 1' },
            { _id: 'project456', name: 'Test Project 2' },
        ];

        //Act
        mockProjectRepository.getAllProjectsAsync.mockResolvedValue(projects);

        const result = await projectService.getAllProjectsAsync();

        //Assert
        expect(result).toEqual(projects);
        expect(mockProjectRepository.getAllProjectsAsync).toHaveBeenCalled();
    });

    it('should get a project by project ID and cache it in Redis if not cached', async () => {
        //Arrange
        const projectId = 'project123';
        const redisData = null;
        const projectData = {
            _id: projectId,
            name: 'Test Project',
            backlog: 'backlog123',
            currentSprint: 'sprint1',
            finishedSprints: ['sprint2'],
        };

        mockProjectRedisRepository.getProjectByIdAsync.mockResolvedValue(
            redisData,
        );
        mockProjectRepository.getProjectByProjectIdAsync.mockResolvedValue(
            projectData,
        );
        mockProjectRedisRepository.cacheProjectAsync.mockResolvedValue(
            projectData,
        );

        //Act
        const result =
            await projectService.getProjectByProjectIdAsync(projectId);

        //Assert
        expect(
            mockProjectRedisRepository.getProjectByIdAsync,
        ).toHaveBeenCalledWith(projectId);
        expect(
            mockProjectRepository.getProjectByProjectIdAsync,
        ).toHaveBeenCalledWith(projectId);
        expect(
            mockProjectRedisRepository.cacheProjectAsync,
        ).toHaveBeenCalledWith(projectData);
        expect(result).toEqual({
            name: 'Test Project',
            backlogId: 'backlog123',
            currentSprintId: 'sprint1',
            finishedSprintIds: ['sprint2'],
        });
    });

    it('should get projects by member ID', async () => {
        //Arrange
        const memberId = 'user1';
        const projects = [
            { _id: 'project123', name: 'Test Project 1' },
            { _id: 'project456', name: 'Test Project 2' },
        ];

        mockProjectRepository.getProjectsByMemberIdAsync.mockResolvedValue(
            projects,
        );

        //Act
        const result =
            await projectService.getProjectsByMemberIdAsync(memberId);

        //Assert
        expect(result).toEqual(projects);
        expect(
            mockProjectRepository.getProjectsByMemberIdAsync,
        ).toHaveBeenCalledWith(memberId);
    });

    it('should get projects by owner ID', async () => {
        //Arrange
        const ownerId = 'owner123';
        const projects = [
            { _id: 'project123', name: 'Test Project 1' },
            { _id: 'project456', name: 'Test Project 2' },
        ];

        mockProjectRepository.getProjectsByOwnerIdAsync.mockResolvedValue(
            projects,
        );

        //Act
        const result = await projectService.getProjectsByOwnerIdAsync(ownerId);

        //Assert
        expect(result).toEqual(projects);
        expect(
            mockProjectRepository.getProjectsByOwnerIdAsync,
        ).toHaveBeenCalledWith(ownerId);
    });

    it('should update a project and trigger relevant Kafka events', async () => {
        //Arrange
        const oldProject = {
            _id: 'project123',
            ownerId: 'owner123',
            userIds: ['user1', 'user3'],
            name: 'Old Project',
        };
        const newProjectData = {
            _id: 'project123',
            ownerId: 'owner123',
            userIds: ['user1', 'user2'],
            name: 'Updated Project',
        };

        mockProjectRedisRepository.getProjectByIdAsync.mockResolvedValue(
            oldProject,
        );
        mockProjectRepository.getProjectByProjectIdAsync.mockResolvedValue(
            oldProject,
        );
        mockProjectRepository.updateProjectAsync.mockResolvedValue(
            newProjectData,
        );
        mockProjectRedisRepository.updateProjectAsync.mockResolvedValue(
            newProjectData,
        );

        //Act
        await projectService.updateProjectAsync(newProjectData);

        //Assert
        expect(mockProjectRepository.updateProjectAsync).toHaveBeenCalledWith(
            newProjectData,
        );
        expect(
            mockProjectRedisRepository.updateProjectAsync,
        ).toHaveBeenCalledWith(newProjectData);

        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
            expect.objectContaining({
                userIds: ['user3'],
                projectId: oldProject._id,
            }),
        );

        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
            expect.objectContaining({
                userIds: ['user2'],
                projectId: oldProject._id,
            }),
        );
    });

    it('should remove user from all projects', async () => {
        //Arrange
        const userId = 'user1';
        const userMemberProjects = [
            {
                _id: 'project123',
                userIds: ['user1', 'user2'],
                ownerId: 'owner123',
            },
        ];
        const userOwnerProjects = [
            { _id: 'project456', userIds: ['user3'], ownerId: 'user1' },
        ];

        mockProjectRepository.getProjectsByMemberIdAsync.mockResolvedValue(
            userMemberProjects,
        );
        mockProjectRepository.getProjectsByOwnerIdAsync.mockResolvedValue(
            userOwnerProjects,
        );

        //Act
        await projectService.removeUserFromProjectsAsync(userId);

        //Assert
        expect(
            mockProjectRepository.getProjectsByMemberIdAsync,
        ).toHaveBeenCalledWith(userId);
        expect(
            mockProjectRepository.getProjectsByOwnerIdAsync,
        ).toHaveBeenCalledWith(userId);
    });

    it('should delete a project and trigger relevant Kafka events', async () => {
        //Arrange
        const projectId = 'project123';
        const project = {
            _id: projectId,
            ownerId: 'owner123',
            userIds: ['user1'],
            backlog: 'backlog123',
            finishedSprints: ['sprint1'],
            currentSprint: 'sprint2',
        };

        mockProjectRepository.deleteProjectByProjectIdAsync.mockResolvedValue(
            project,
        );
        mockProjectRedisRepository.deleteProjectByIdAsync.mockResolvedValue(
            true,
        );
        mockBacklogRepository.deleteBacklogByIdAsync.mockResolvedValue(true);
        mockSprintRepository.deleteSprintsByIdsAsync.mockResolvedValue(true);

        //Act
        await projectService.deleteProjectByProjectIdAsync(projectId);

        //Assert
        expect(
            mockProjectRedisRepository.deleteProjectByIdAsync,
        ).toHaveBeenCalledWith(projectId);
        expect(
            mockProjectRepository.deleteProjectByProjectIdAsync,
        ).toHaveBeenCalledWith(projectId);
        expect(
            mockBacklogRepository.deleteBacklogByIdAsync,
        ).toHaveBeenCalledWith(project.backlog);
        expect(
            mockSprintRepository.deleteSprintsByIdsAsync,
        ).toHaveBeenCalledWith([
            ...project.finishedSprints,
            project.currentSprint,
        ]);

        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
            expect.objectContaining({
                userIds: ['owner123', 'user1'],
                projectId: project._id,
            }),
        );
        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_DELETE_PROJECT_TOPIC,
            expect.objectContaining({
                backlogId: project.backlog,
            }),
        );
    });
});
