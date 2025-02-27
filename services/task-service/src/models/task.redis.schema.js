import { SchemaFieldTypes } from 'redis';

const TaskIndexSchema = {
    sprintId: {
        type: SchemaFieldTypes.TAG,
        as: 'sprintId',
    },
    backlogId: {
        type: SchemaFieldTypes.TAG,
        as: 'backlogId',
    },
    backlogStatus: {
        type: SchemaFieldTypes.TAG,
        as: 'backlogStatus',
    },
    sprintEnded: {
        type: SchemaFieldTypes.NUMERIC,
        as: 'sprintEnded',
    },
};

export default TaskIndexSchema;
