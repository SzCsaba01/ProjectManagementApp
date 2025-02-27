import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
    },
    ownerId: {
        type: String,
        required: true,
    },
    userIds: [
        {
            type: String,
        },
    ],
    currentSprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint',
        default: null,
    },
    finishedSprints: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sprint',
        },
    ],
    backlog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Backlog',
    },
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
