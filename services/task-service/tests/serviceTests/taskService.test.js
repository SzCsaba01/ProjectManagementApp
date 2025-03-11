import { TaskService } from '../../src/services/index.js';
import {
    TaskStatus,
    TaskPriority,
    TaskCategory,
    BacklogStatus,
} from '../../src/utils/index.js';

jest.mock('fs');
jest.mock('path');
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('uuid-mock') }));

describe('TaskService', () => {
    let taskService;
    let mockTaskRepository;
    let mockTaskRedisRepository;

    beforeEach(() => {
        mockTaskRepository = {
            createTaskAsync: jest.fn(),
            updateTaskAsync: jest.fn(),
            updateTasksAsync: jest.fn(),
            getCurrentSprintTasksBySprintIdAsync: jest.fn(),
            getTasksBySprintIdAsync: jest.fn(),
            getTasksByBacklogIdAsync: jest.fn(),
            getTasksByAssigneeIdAsync: jest.fn(),
            getTasksByCreatorIdAsync: jest.fn(),
            deleteTaskByIdAsync: jest.fn(),
            deleteTasksByBacklogIdAsync: jest.fn(),
            deleteTasksBySprintIdAsync: jest.fn(),
        };

        mockTaskRedisRepository = {
            cacheTaskAsync: jest.fn(),
            cacheTasksAsync: jest.fn(),
            updateTaskAsync: jest.fn(),
            updateTasksAsync: jest.fn(),
            deleteTaskAsync: jest.fn(),
            deleteTasksAsync: jest.fn(),
            getCurrentSprintTasksBySprintIdAsync: jest.fn(),
            getTasksByBacklogIdAsync: jest.fn(),
        };

        taskService = new TaskService({
            taskRepository: mockTaskRepository,
            taskRedisRepository: mockTaskRedisRepository,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a task and save attachments if files are provided', async () => {
        const newTaskData = {
            name: 'Test Task',
            description: 'Task Description',
            priority: TaskPriority.Low.description,
            category: TaskCategory.Feature.description,
            backlogStatus: BacklogStatus.Blocked.description,
            index: 1,
            assigneeId: '123',
            creatorId: '456',
            status: TaskStatus.NotStarted.description,
            backlogId: 'backlog123',
            sprintId: 'sprint123',
            storyPoints: '5',
        };
        const files = [
            { mimetype: 'image/png', buffer: Buffer.from('file-content') },
        ];
        const host = 'http://localhost';

        mockTaskRepository.createTaskAsync.mockResolvedValue({
            ...newTaskData,
            id: 'task-id',
            attachments: [],
        });

        mockTaskRepository.updateTaskAsync.mockResolvedValue({
            ...newTaskData,
            id: 'task-id',
            attachments: [
                'http://localhost/resources/attachments/task-id/uuid-mock.png',
            ],
        });

        const savedTask = await taskService.createTaskAsync(
            newTaskData,
            host,
            files,
        );

        expect(mockTaskRepository.createTaskAsync).toHaveBeenCalledWith(
            newTaskData,
        );
        expect(mockTaskRepository.updateTaskAsync).toHaveBeenCalled();
        expect(mockTaskRedisRepository.cacheTaskAsync).toHaveBeenCalled();

        expect(savedTask).toHaveProperty('id', 'task-id');
        expect(savedTask.attachments).toHaveLength(1);
    });

    it('should retrieve current sprint tasks from Redis', async () => {
        const sprintId = 'sprint123';
        const redisTasks = [
            { id: 'task1', name: 'Task 1', sprintId },
            { id: 'task2', name: 'Task 2', sprintId },
        ];

        mockTaskRedisRepository.getCurrentSprintTasksBySprintIdAsync.mockResolvedValue(
            redisTasks,
        );

        const tasks =
            await taskService.getCurrentSprintTasksBySprintIdAsync(sprintId);

        expect(
            mockTaskRedisRepository.getCurrentSprintTasksBySprintIdAsync,
        ).toHaveBeenCalledWith(sprintId);
        expect(tasks).toEqual(redisTasks);
    });

    it('should retrieve current sprint tasks from the repository if not in Redis', async () => {
        const sprintId = 'sprint123';
        const redisTasks = [];
        const repositoryTasks = [
            { id: 'task1', name: 'Task 1', sprintId },
            { id: 'task2', name: 'Task 2', sprintId },
        ];

        mockTaskRedisRepository.getCurrentSprintTasksBySprintIdAsync.mockResolvedValue(
            redisTasks,
        );
        mockTaskRepository.getCurrentSprintTasksBySprintIdAsync.mockResolvedValue(
            repositoryTasks,
        );

        const tasks =
            await taskService.getCurrentSprintTasksBySprintIdAsync(sprintId);

        expect(
            mockTaskRedisRepository.getCurrentSprintTasksBySprintIdAsync,
        ).toHaveBeenCalledWith(sprintId);
        expect(
            mockTaskRepository.getCurrentSprintTasksBySprintIdAsync,
        ).toHaveBeenCalledWith(sprintId);
        expect(mockTaskRedisRepository.cacheTasksAsync).toHaveBeenCalledWith(
            repositoryTasks,
        );
        expect(tasks).toEqual(repositoryTasks);
    });

    it('should update a task and save new attachments', async () => {
        const updatedTaskData = {
            id: 'task-id',
            name: 'Updated Task',
            attachments: [],
            status: TaskStatus.InProgress.description,
        };
        const files = [
            {
                mimetype: 'image/jpeg',
                buffer: Buffer.from('updated-file-content'),
            },
        ];
        const host = 'http://localhost';

        mockTaskRepository.updateTaskAsync.mockResolvedValue(updatedTaskData);
        mockTaskRedisRepository.updateTaskAsync.mockResolvedValue(
            updatedTaskData,
        );

        const updatedTask = await taskService.updateTaskAsync(
            updatedTaskData,
            host,
            files,
        );

        expect(mockTaskRepository.updateTaskAsync).toHaveBeenCalledWith(
            updatedTaskData,
        );
        expect(mockTaskRedisRepository.updateTaskAsync).toHaveBeenCalledWith(
            updatedTaskData,
        );
        expect(updatedTask.attachments).toHaveLength(1);
    });

    it('should remove all attachments when deleting a task', async () => {
        const taskId = 'task-id';

        mockTaskRepository.deleteTaskByIdAsync.mockResolvedValue({
            id: taskId,
        });

        await taskService.deleteTaskByIdAsync(taskId);

        expect(mockTaskRepository.deleteTaskByIdAsync).toHaveBeenCalledWith(
            taskId,
        );
        expect(mockTaskRedisRepository.deleteTaskAsync).toHaveBeenCalledWith({
            id: taskId,
        });
    });

    it('should remove user from all tasks', async () => {
        const userId = 'user-id';

        const assignedTasks = [{ id: 'task1', assigneeId: userId }];
        const createdTasks = [{ id: 'task2', creatorId: userId }];

        mockTaskRepository.getTasksByAssigneeIdAsync.mockResolvedValue(
            assignedTasks,
        );
        mockTaskRepository.getTasksByCreatorIdAsync.mockResolvedValue(
            createdTasks,
        );
        mockTaskRepository.updateTasksAsync.mockResolvedValue([
            ...assignedTasks,
            ...createdTasks,
        ]);

        await taskService.removeUserFromTasksAsync(userId);

        expect(mockTaskRepository.updateTasksAsync).toHaveBeenCalledWith([
            { id: 'task1', assigneeId: null },
            { id: 'task2', creatorId: null },
        ]);
        expect(mockTaskRedisRepository.updateTasksAsync).toHaveBeenCalledWith([
            { id: 'task1', assigneeId: null },
            { id: 'task2', creatorId: null },
        ]);
    });

    it('should start a sprint and update task sprint IDs', async () => {
        const sprintData = { sprintId: 'sprint123', backlogId: 'backlog123' };
        const backlogTasks = [
            { id: 'task1', backlogId: 'backlog123' },
            { id: 'task2', backlogId: 'backlog123' },
        ];

        mockTaskRepository.getTasksByBacklogIdAsync.mockResolvedValue(
            backlogTasks,
        );
        mockTaskRepository.updateTasksAsync.mockResolvedValue(backlogTasks);
        mockTaskRedisRepository.updateTasksAsync.mockResolvedValue(
            backlogTasks,
        );

        await taskService.startSprintAsync(sprintData);

        expect(mockTaskRepository.updateTasksAsync).toHaveBeenCalledWith([
            { id: 'task1', backlogId: 'backlog123', sprintId: 'sprint123' },
            { id: 'task2', backlogId: 'backlog123', sprintId: 'sprint123' },
        ]);
        expect(mockTaskRedisRepository.updateTasksAsync).toHaveBeenCalledWith([
            { id: 'task1', backlogId: 'backlog123', sprintId: 'sprint123' },
            { id: 'task2', backlogId: 'backlog123', sprintId: 'sprint123' },
        ]);
    });

    it('should finish a sprint and mark tasks as ended', async () => {
        const sprintData = { sprintId: 'sprint123' };
        const sprintTasks = [
            { id: 'task1', sprintId: 'sprint123' },
            { id: 'task2', sprintId: 'sprint123' },
        ];

        mockTaskRepository.getCurrentSprintTasksBySprintIdAsync.mockResolvedValue(
            sprintTasks,
        );
        mockTaskRepository.updateTasksAsync.mockResolvedValue(sprintTasks);
        mockTaskRedisRepository.deleteTasksAsync.mockResolvedValue(sprintTasks);

        await taskService.finishSprintAsync(sprintData);

        expect(mockTaskRepository.updateTasksAsync).toHaveBeenCalledWith([
            { id: 'task1', sprintId: 'sprint123', sprintEnded: true },
            { id: 'task2', sprintId: 'sprint123', sprintEnded: true },
        ]);
        expect(mockTaskRedisRepository.deleteTasksAsync).toHaveBeenCalledWith(
            sprintTasks,
        );
    });
});
