import mongoose from 'mongoose';
import { RESOURCES, ACTIONS } from '../utils/index.js';

const permissionSchema = new mongoose.Schema({
    resource: {
        type: String,
        required: true,
        enum: Object.values(RESOURCES),
    },
    action: {
        type: String,
        required: true,
        enum: Object.values(ACTIONS),
    },
});

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

const Permission = mongoose.model('Permission', permissionSchema);
export default Permission;
