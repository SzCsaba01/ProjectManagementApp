import { Task } from '../models/index.js';
import { BacklogStatus } from '../utils/index.js';

class TaskRepository {
    async createTaskAsync(task) {
        return await Task.create(task);
    }

    async getCurrentSprintTasksBySprintIdAsync(sprintId) {
        return await Task.find({
            sprintId: sprintId,
            backlogStatus: BacklogStatus.CurrentSprint.description,
        }).sort({ index: 1 });
    }

    async getTasksBySprintIdAsync(sprintId) {
        return await Task.find({ sprintId: sprintId }).sort({ index: 1 });
    }

    async getAllTasksByBacklogIdAsync(backlogId) {
        return await Task.find({ backlogId: backlogId });
    }

    async getTasksByBacklogIdAsync(backlogId) {
        return await Task.find({
            backlogId: backlogId,
            sprintEnded: false,
        }).sort({ index: 1 });
    }

    async getTasksByAssigneeIdAsync(assigneId) {
        return await Task.find({ assigneeId: assigneId });
    }

    async getTasksByCreatorIdAsync(creatorId) {
        return await Task.find({ creatorId: creatorId });
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

    async deleteTaskByIdAsync(taskId) {
        return await Task.findOneAndDelete({ _id: taskId });
    }

    async deleteTasksByBacklogIdAsync(backlogId) {
        return await Task.deleteMany({ backlogId: backlogId });
    }

    async deleteTasksBySprintIdAsync(sprintId) {
        return await Task.deleteMany({ sprintId: sprintId });
    }
}

export default TaskRepository;
