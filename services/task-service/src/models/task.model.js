import mongoose from 'mongoose';
import {
    TaskStatus,
    TaskPriority,
    TaskCategory,
    BacklogStatus,
} from '../utils/index.js';

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    description: {
        type: String,
        maxLength: 500,
    },
    attachments: [
        {
            type: String,
        },
    ],
    priority: {
        type: String,
        enum: Object.values(TaskPriority).map((symbol) => symbol.description),
    },
    category: {
        type: String,
        enum: Object.values(TaskCategory).map((symbol) => symbol.description),
    },
    backlogStatus: {
        type: String,
        enum: Object.values(BacklogStatus).map((symbol) => symbol.description),
        required: true,
    },
    index: {
        type: Number,
        required: true,
        default: 0,
    },
    assigneeId: {
        type: String,
        index: true,
    },
    creatorId: {
        type: String,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus).map((symbol) => symbol.description),
        required: true,
        default: TaskStatus.NotStarted.description,
    },
    backlogId: {
        type: String,
        index: true,
    },
    sprintId: {
        type: String,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    plannedAt: {
        type: Date,
    },
    startedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    finishedAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
