import { Task } from '../models/index.js';
import { BacklogStatus } from '../utils/index.js';

class TaskRepository {
    async createTaskAsync(task) {
        return await Task.create(task);
    }

    async getCurrentSprintTasksBySprintIdAsync(sprintId) {
        return await Task.find({ sprintId: sprintId }).sort({ index: 1 });
    }

    async getCurrentSprintTasksByBacklogIdAsync(backlogId) {
        return await Task.find({
            backlogId: backlogId,
            backlogStatus: BacklogStatus.CurrentSprint.description,
        });
    }

    async getTasksByBacklogIdAsync(backlogId) {
        return await Task.find({ backlogId: backlogId }).sort({ index: 1 });
    }

    async getFinishedTasksBySprintId(sprintId) {
        return await Task.find({
            sprintId: sprintId,
            status: TaskStatus.Completed.description,
        });
    }

    async updateTaskAsync(task) {
        const { _id, ...taskWithoutId } = task;

        return await Task.findOneAndUpdate(
            {
                _id: _id,
            },
            taskWithoutId,
            {
                new: true,
                runValidators: true,
            },
        );
    }

    async updateTasksAsync(tasks) {
        const bulkOps = tasks.map((task) => ({
            updateOne: {
                filter: { _id: task._id },
                update: { $set: task },
            },
        }));

        return await Task.bulkWrite(bulkOps);
    }
}

export default TaskRepository;
