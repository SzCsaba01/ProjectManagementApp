import mongoose from 'mongoose';

const backlogSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
});

const Backlog = mongoose.model('Backlog', backlogSchema);

export default Backlog;
