import { SprintService } from '../../src/services/index.js';
import { publishProjectEventToTopicAsync } from '../../src/kafka/index.js';

jest.mock('../../src/repositories/index.js', () => ({
    SprintRepository: jest.fn(),
    SprintRedisRepository: jest.fn(),
    ProjectRepository: jest.fn(),
    ProjectRedisRepository: jest.fn(),
}));

jest.mock('../../src/kafka/index.js');

describe('SprintService', () => {
    let sprintService;
    let mockSprintRepository;
    let mockSprintRedisRepository;
    let mockProjectRepository;
    let mockProjectRedisRepository;

    beforeEach(() => {
        mockSprintRepository = {
            createSprintAsync: jest.fn(),
            getSprintByIdAsync: jest.fn(),
            getSprintsByIdsAsync: jest.fn(),
            updateSprintAsync: jest.fn(),
            deleteSprintByIdAsync: jest.fn(),
        };

        mockSprintRedisRepository = {
            cacheSprintAsync: jest.fn(),
            getSprintByIdAsync: jest.fn(),
            cacheSprintsAsync: jest.fn(),
            updateSprintAsync: jest.fn(),
            deleteSprintByIdAsync: jest.fn(),
            getSprintsByIdsAsync: jest.fn(),
        };

        mockProjectRepository = {
            updateProjectAsync: jest.fn(),
            getProjectByProjectIdAsync: jest.fn(),
            updateProjectAsync: jest.fn(),
            getProjectByIdAsync: jest.fn(),
        };

        mockProjectRedisRepository = {
            getProjectByIdAsync: jest.fn(),
            updateProjectAsync: jest.fn(),
        };

        sprintService = new SprintService({
            sprintRepository: mockSprintRepository,
            sprintRedisRepository: mockSprintRedisRepository,
            projectRepository: mockProjectRepository,
            projectRedisRepository: mockProjectRedisRepository,
        });
    });

    it('should create a sprint for a project and trigger Kafka events', async () => {
        const projectId = 'project123';
        const backlogId = 'backlog123';
        const sprintData = { name: 'Sprint 1', startDate: new Date() };
        const createdSprint = { _id: 'sprint123', ...sprintData };
        const project = { _id: projectId, currentSprint: null };
        const redisProject = null;

        mockSprintRepository.createSprintAsync.mockResolvedValue(createdSprint);
        mockSprintRedisRepository.cacheSprintAsync.mockResolvedValue(
            createdSprint,
        );
        mockProjectRepository.getProjectByProjectIdAsync.mockResolvedValue(
            project,
        );
        mockProjectRedisRepository.getProjectByIdAsync.mockResolvedValue(
            redisProject,
        );
        mockProjectRepository.updateProjectAsync.mockResolvedValue(project);
        mockProjectRedisRepository.updateProjectAsync.mockResolvedValue(
            project,
        );

        const result = await sprintService.createSprintForProjectAsync(
            projectId,
            backlogId,
            sprintData,
        );

        expect(mockSprintRepository.createSprintAsync).toHaveBeenCalledWith(
            sprintData,
        );
        expect(mockSprintRedisRepository.cacheSprintAsync).toHaveBeenCalledWith(
            createdSprint,
        );
        expect(
            mockProjectRepository.getProjectByProjectIdAsync,
        ).toHaveBeenCalledWith(projectId);
        expect(mockProjectRepository.updateProjectAsync).toHaveBeenCalledWith({
            ...project,
            currentSprint: createdSprint._id,
        });
        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_START_SPRINT_TOPIC,
            expect.objectContaining({
                sprintId: createdSprint._id,
                backlogId,
            }),
        );

        expect(result).toBe(createdSprint._id);
    });

    it('should get a sprint by ID and cache it if not in Redis', async () => {
        const sprintId = 'sprint123';
        const sprintData = { _id: sprintId, name: 'Sprint 1' };
        const redisData = null; // Simulate no data in Redis

        mockSprintRedisRepository.getSprintByIdAsync.mockResolvedValue(
            redisData,
        );
        mockSprintRepository.getSprintByIdAsync.mockResolvedValue(sprintData);
        mockSprintRedisRepository.cacheSprintAsync.mockResolvedValue(
            sprintData,
        );

        const result = await sprintService.getSprintByIdAsync(sprintId);

        expect(
            mockSprintRedisRepository.getSprintByIdAsync,
        ).toHaveBeenCalledWith(sprintId);
        expect(mockSprintRepository.getSprintByIdAsync).toHaveBeenCalledWith(
            sprintId,
        );
        expect(mockSprintRedisRepository.cacheSprintAsync).toHaveBeenCalledWith(
            sprintData,
        );

        expect(result).toEqual(sprintData);
    });

    it('should get multiple sprints by IDs', async () => {
        const sprintIds = ['sprint123', 'sprint456'];
        const redisSprints = [{ _id: 'sprint123', name: 'Sprint 1' }];
        const dbSprints = [{ _id: 'sprint456', name: 'Sprint 2' }];

        const missedSprintIds = sprintIds.filter((sprintId) => {
            return !redisSprints.some(
                (redisSprint) => redisSprint._id === sprintId,
            );
        });
        mockSprintRedisRepository.getSprintsByIdsAsync.mockResolvedValue(
            redisSprints,
        );
        mockSprintRepository.getSprintsByIdsAsync.mockResolvedValue(dbSprints);
        mockSprintRedisRepository.cacheSprintsAsync.mockResolvedValue([
            ...redisSprints,
            ...dbSprints,
        ]);

        const result = await sprintService.getSprintsByIdsAsync(sprintIds);

        expect(
            mockSprintRedisRepository.getSprintsByIdsAsync,
        ).toHaveBeenCalledWith(sprintIds);
        expect(mockSprintRepository.getSprintsByIdsAsync).toHaveBeenCalledWith(
            missedSprintIds,
        );
        expect(
            mockSprintRedisRepository.cacheSprintsAsync,
        ).toHaveBeenCalledWith([...redisSprints, ...dbSprints]);

        expect(result).toEqual([...redisSprints, ...dbSprints]);
    });

    it('should update a sprint', async () => {
        const sprintData = { _id: 'sprint123', name: 'Updated Sprint' };

        mockSprintRepository.updateSprintAsync.mockResolvedValue(sprintData);
        mockSprintRedisRepository.updateSprintAsync.mockResolvedValue(
            sprintData,
        );

        await sprintService.updateSprintAsync(sprintData);

        expect(mockSprintRepository.updateSprintAsync).toHaveBeenCalledWith(
            sprintData,
        );
        expect(
            mockSprintRedisRepository.updateSprintAsync,
        ).toHaveBeenCalledWith(sprintData);
    });

    it('should finish a sprint and trigger Kafka events', async () => {
        const sprintData = {
            sprintId: 'sprint123',
            projectId: 'project123',
            endDate: new Date(),
        };
        const sprint = { _id: 'sprint123', name: 'Sprint 1' };
        const project = {
            _id: 'project123',
            currentSprint: 'sprint123',
            finishedSprints: [],
        };

        mockSprintRepository.getSprintByIdAsync.mockResolvedValue(sprint);
        mockProjectRepository.getProjectByProjectIdAsync.mockResolvedValue(
            project,
        );
        mockProjectRedisRepository.getProjectByIdAsync.mockResolvedValue(null);
        mockProjectRepository.updateProjectAsync.mockResolvedValue(project);
        mockProjectRedisRepository.updateProjectAsync.mockResolvedValue(
            project,
        );
        mockSprintRepository.updateSprintAsync.mockResolvedValue(sprint);
        mockSprintRedisRepository.updateSprintAsync.mockResolvedValue(sprint);

        await sprintService.finishSprintAsync(sprintData);

        expect(mockProjectRepository.updateProjectAsync).toHaveBeenCalledWith({
            ...project,
            currentSprint: null,
            finishedSprints: [sprintData.sprintId],
        });

        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_FINISH_SPRINT_TOPIC,
            expect.objectContaining({
                sprintId: sprintData.sprintId,
            }),
        );
    });

    it('should delete a sprint and trigger Kafka events', async () => {
        const sprintId = 'sprint123';
        const projectId = 'project123';
        const project = { _id: projectId, finishedSprints: [sprintId] };

        mockProjectRepository.getProjectByProjectIdAsync.mockResolvedValue(
            project,
        );
        mockProjectRedisRepository.getProjectByIdAsync.mockResolvedValue(null);
        mockProjectRepository.updateProjectAsync.mockResolvedValue(project);
        mockProjectRedisRepository.updateProjectAsync.mockResolvedValue(
            project,
        );
        mockSprintRepository.deleteSprintByIdAsync.mockResolvedValue(true);
        mockSprintRedisRepository.deleteSprintByIdAsync.mockResolvedValue(true);

        await sprintService.deleteSprintAsync(sprintId, projectId);

        expect(mockProjectRepository.updateProjectAsync).toHaveBeenCalledWith({
            ...project,
            finishedSprints: [],
        });

        expect(publishProjectEventToTopicAsync).toHaveBeenCalledWith(
            process.env.KAFKA_DELETE_SPRINT_TOPIC,
            expect.objectContaining({
                sprintId,
            }),
        );
    });
});
