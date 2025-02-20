import { publishProjectEventToTopicAsync } from '../kafka/index.js';

class SprintService {
    constructor({ sprintRepository, projectRepository }) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    async createSprintForProjectAsync(projectId, backlogId, sprintData) {
        sprintData.project = projectId;

        const sprint =
            await this.sprintRepository.createSprintAsync(sprintData);

        const project =
            await this.projectRepository.getProjectByProjectIdAsync(projectId);
        project.currentSprint = sprint._id;
        await this.projectRepository.updateProjectAsync(project);

        await publishProjectEventToTopicAsync(
            process.env.KAFKA_START_SPRINT_TOPIC,
            {
                sprintId: sprint._id,
                backlogId: backlogId,
            },
        );
        return sprint._id;
    }

    async getSprintByIdAsync(sprintId) {
        const sprint = await this.sprintRepository.getSprintByIdAsync(sprintId);

        return sprint;
    }

    async getSprintsByIdsAsync(sprintIds) {
        const sprints =
            await this.sprintRepository.getSprintsByIdsAsync(sprintIds);
        return sprints;
    }

    async updateSprintAsync(newSprintData) {
        await this.sprintRepository.updateSprintAsync(newSprintData);
    }

    async finishSprintAsync(sprintData) {
        const sprint = await this.sprintRepository.getSprintByIdAsync(
            sprintData.sprintId,
        );
        const project = await this.projectRepository.getProjectByProjectIdAsync(
            sprintData.projectId,
        );

        sprint.endDate = sprintData.endDate;

        project.currentSprint = null;

        project.finishedSprints.push(sprintData.sprintId);

        await publishProjectEventToTopicAsync(
            process.env.KAFKA_FINISH_SPRINT_TOPIC,
            {
                sprintId: sprintData.sprintId,
            },
        );
        await this.projectRepository.updateProjectAsync(project);
        await this.sprintRepository.updateSprintAsync(sprint);
    }

    async deleteSprintAsync(sprintId, projectId) {
        const project =
            await this.projectRepository.getProjectByProjectIdAsync(projectId);

        project.finishedSprints = project.finishedSprints.filter((id) => {
            const stringId = id.toString();
            return stringId !== sprintId;
        });
        await this.projectRepository.updateProjectAsync(project);

        await this.sprintRepository.deleteSprintByIdAsync(sprintId);

        const messageData = {
            sprintId: sprintId,
        };

        await publishProjectEventToTopicAsync(
            process.env.KAFKA_DELETE_SPRINT_TOPIC,
            messageData,
        );
    }
}

export default SprintService;
