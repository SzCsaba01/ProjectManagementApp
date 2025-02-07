import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    startDate: {
        type: Date,
        required: true,
    },
    plannedEndDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
});

const Sprint = mongoose.model('Sprint', sprintSchema);

export default Sprint;
