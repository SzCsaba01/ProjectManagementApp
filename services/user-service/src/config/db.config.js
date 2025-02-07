import mongoose from 'mongoose';
import { Role, Permission } from '../models/index.js';
import { RESOURCES, ACTIONS } from '../utils/index.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {});
        console.log('MongoDB connected successfully');

        await initializePermissions();
        await initializeRoles();
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

const initializeRoles = async () => {
    const rolesWithPermissions = {
        Admin: Object.values(RESOURCES).flatMap((resource) =>
            Object.values(ACTIONS).map((action) => ({ resource, action })),
        ),
        Manager: [
            { resource: RESOURCES.PROJECT, action: ACTIONS.MANAGE },
            { resource: RESOURCES.SPRINT, action: ACTIONS.MANAGE },
            { resource: RESOURCES.BACKLOG, action: ACTIONS.MANAGE },
            { resource: RESOURCES.TASK, action: ACTIONS.MANAGE },
        ],
        User: [
            { resource: RESOURCES.PROJECT, action: ACTIONS.VIEW },
            { resource: RESOURCES.BACKLOG, action: ACTIONS.UPDATE },
            { resource: RESOURCES.SPRINT, action: ACTIONS.VIEW },
            { resource: RESOURCES.TASK, action: ACTIONS.MANAGE },
        ],
    };

    for (const [roleName, permissions] of Object.entries(
        rolesWithPermissions,
    )) {
        let role = await Role.findOne({ name: roleName });
        if (!role) {
            role = await Role.create({ name: roleName });
        }

        const permissionDocs = [];
        for (const permission of permissions) {
            const permissionDoc = await Permission.findOne(permission);
            if (permissionDoc) {
                permissionDocs.push(permissionDoc._id);
            }
        }

        role.permissions = permissionDocs;
        await role.save();
        console.log(`Role '${roleName}' updated with permissions`);
    }
};
const initializePermissions = async () => {
    const permissionsToSeed = [];

    Object.values(RESOURCES).forEach((resource) => {
        Object.values(ACTIONS).forEach((action) => {
            permissionsToSeed.push({ resource, action });
        });
    });

    for (let permission of permissionsToSeed) {
        const permissionExists = await Permission.findOne(permission);
        if (!permissionExists) {
            await Permission.create(permission);
            console.log(
                `Permission '${permission.resource}:${permission.action}' created`,
            );
        }
    }
};

export { connectDB };
