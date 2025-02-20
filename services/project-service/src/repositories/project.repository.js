import { Project } from '../models/index.js';

class ProjectRepository {
    async createProjectAsync(project) {
        return await Project.create(project);
    }

    async getAllProjectsAsync() {
        return await Project.find({});
    }

    async getProjectByProjectIdAsync(projectId) {
        return await Project.findOne({ _id: projectId });
    }

    async getProjectsByOnwerIdAsync(ownerId) {
        return await Project.find({ ownerId: ownerId });
    }

    async getProjectsByMemberIdAsync(memberId) {
        return await Project.find({ userIds: memberId });
    }

    async getProjectsByOwnerIdAsync(ownerId) {
        return await Project.find({ ownerId: ownerId });
    }

    async getOtherOwnerIdAsync(userId) {
        return await Project.findOne({ ownerId: { $ne: userId } })
            .select('ownerId')
            .lean()
            .then((project) => project?.ownerId || null);
    }

    async updateProjectAsync(project) {
        const { _id, ...projectWithoutId } = project;
        return await Project.findOneAndUpdate(
            {
                _id: _id,
            },
            projectWithoutId,
            { new: true, runValidators: true },
        );
    }

    async updateProjectsAsync(projects) {
        const bulkOps = projects.map((project) => ({
            updateOne: {
                filter: { _id: project._id },
                update: { $set: project },
            },
        }));

        return await Project.bulkWrite(bulkOps);
    }

    async deleteProjectByProjectIdAsync(projectId) {
        return await Project.findOneAndDelete({ _id: projectId });
    }
}

export default ProjectRepository;
