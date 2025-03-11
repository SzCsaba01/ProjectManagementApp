import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TaskRepository } from '../../src/repositories/index.js';
import { Task } from '../../src/models/index.js';
import {
    BacklogStatus,
    TaskStatus,
    TaskPriority,
    TaskCategory,
} from '../../src/utils/index.js';

describe('TaskRepository', () => {
    let mongoServer;
    let taskRepository;

    const createTestTask = async (overrides = {}) => {
        const defaultTask = {
            name: 'Test Task',
            description: 'A description of the task',
            priority: TaskPriority.Low.description,
            category: TaskCategory.Feature.description,
            backlogStatus: BacklogStatus.Blocked.description,
            index: 1,
            assigneeId: '123',
            creatorId: '456',
            status: TaskStatus.NotStarted.description,
            backlogId: 'backlog123',
            sprintId: 'sprint123',
        };
        return await Task.create({ ...defaultTask, ...overrides });
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        taskRepository = new TaskRepository();
    });

    beforeEach(async () => {
        await Task.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should create a task', async () => {
        // Arrange
        const taskData = {
            name: 'Test Task',
            description: 'Description of the task',
            priority: TaskPriority.Medium.description,
            category: TaskCategory.Bugfix.description,
            backlogStatus: BacklogStatus.CurrentSprint.description,
            index: 1,
            assigneeId: '123',
            creatorId: '456',
            status: TaskStatus.InProgress.description,
            backlogId: 'backlog123',
            sprintId: 'sprint123',
        };

        // Act
        const task = await taskRepository.createTaskAsync(taskData);

        // Assert
        expect(task).toHaveProperty('_id');
        expect(task.name).toBe(taskData.name);
        expect(task.priority).toBe(taskData.priority);
        expect(task.category).toBe(taskData.category);
    });

    it('should retrieve tasks by sprint ID', async () => {
        // Arrange
        const task1 = await createTestTask({
            name: 'Task 1',
            sprintId: 'sprint123',
        });
        const task2 = await createTestTask({
            name: 'Task 2',
            sprintId: 'sprint123',
        });

        // Act
        const tasks = await taskRepository.getTasksBySprintIdAsync('sprint123');

        // Assert
        expect(tasks.length).toBe(2);
        expect(tasks[0].name).toBe('Task 1');
        expect(tasks[1].name).toBe('Task 2');
    });

    it('should retrieve current sprint tasks by sprint ID', async () => {
        // Arrange
        const task1 = await createTestTask({
            name: 'Task 1',
            sprintId: 'sprint123',
            backlogStatus: BacklogStatus.CurrentSprint.description,
        });
        const task2 = await createTestTask({
            name: 'Task 2',
            sprintId: 'sprint123',
            backlogStatus: BacklogStatus.CurrentSprint.description,
        });
        const task3 = await createTestTask({
            name: 'Task 3',
            sprintId: 'sprint123',
            backlogStatus: BacklogStatus.Blocked.description,
        });

        // Act
        const tasks =
            await taskRepository.getCurrentSprintTasksBySprintIdAsync(
                'sprint123',
            );

        // Assert
        expect(tasks.length).toBe(2);
        expect(tasks[0].name).toBe('Task 1');
        expect(tasks[1].name).toBe('Task 2');
    });

    it('should retrieve tasks by assignee ID', async () => {
        // Arrange
        const task1 = await createTestTask({
            name: 'Task 1',
            assigneeId: '123',
        });
        const task2 = await createTestTask({
            name: 'Task 2',
            assigneeId: '123',
        });

        // Act
        const tasks = await taskRepository.getTasksByAssigneeIdAsync('123');

        // Assert
        expect(tasks.length).toBe(2);
        expect(tasks[0].name).toBe('Task 1');
        expect(tasks[1].name).toBe('Task 2');
    });

    it('should retrieve tasks by creator ID', async () => {
        // Arrange
        const task1 = await createTestTask({
            name: 'Task 1',
            creatorId: '456',
        });
        const task2 = await createTestTask({
            name: 'Task 2',
            creatorId: '456',
        });

        // Act
        const tasks = await taskRepository.getTasksByCreatorIdAsync('456');

        // Assert
        expect(tasks.length).toBe(2);
        expect(tasks[0].name).toBe('Task 1');
        expect(tasks[1].name).toBe('Task 2');
    });

    it('should update a task', async () => {
        // Arrange
        const task = await createTestTask({ name: 'Old Name' });
        task.name = 'Updated Name';

        // Act
        const updatedTask = await taskRepository.updateTaskAsync(task);

        // Assert
        expect(updatedTask.name).toBe('Updated Name');
    });

    it('should update multiple tasks', async () => {
        // Arrange
        const task1 = await createTestTask({ name: 'Task 1' });
        const task2 = await createTestTask({ name: 'Task 2' });

        task1.name = 'Updated Task 1';
        task2.name = 'Updated Task 2';

        // Act
        await taskRepository.updateTasksAsync([task1, task2]);

        // Assert
        const updatedTask1 = await Task.findById(task1._id);
        const updatedTask2 = await Task.findById(task2._id);

        expect(updatedTask1.name).toBe('Updated Task 1');
        expect(updatedTask2.name).toBe('Updated Task 2');
    });

    it('should delete a task by ID', async () => {
        // Arrange
        const task = await createTestTask({ name: 'To Be Deleted' });

        // Act
        await taskRepository.deleteTaskByIdAsync(task._id);

        // Assert
        const foundTask = await Task.findById(task._id);
        expect(foundTask).toBeNull();
    });

    it('should delete tasks by sprint ID', async () => {
        // Arrange
        const task1 = await createTestTask({
            name: 'Task 1',
            sprintId: 'sprint123',
        });
        const task2 = await createTestTask({
            name: 'Task 2',
            sprintId: 'sprint123',
        });

        // Act
        await taskRepository.deleteTasksBySprintIdAsync('sprint123');

        // Assert
        const tasks = await Task.find({ sprintId: 'sprint123' });
        expect(tasks.length).toBe(0);
    });

    it('should delete tasks by backlog ID', async () => {
        // Arrange
        const task1 = await createTestTask({
            name: 'Task 1',
            backlogId: 'backlog123',
        });
        const task2 = await createTestTask({
            name: 'Task 2',
            backlogId: 'backlog123',
        });

        // Act
        await taskRepository.deleteTasksByBacklogIdAsync('backlog123');

        // Assert
        const tasks = await Task.find({ backlogId: 'backlog123' });
        expect(tasks.length).toBe(0);
    });
});
