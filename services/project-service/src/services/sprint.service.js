import { publishEventToTopic } from '../kafka/index.js';

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

        await publishEventToTopic(process.env.KAFKA_START_SPRINT_TOPIC, {
            sprintId: sprint._id,
            backlogId: backlogId,
        });
        return sprint._id;
    }

    async updateSprintAsync(newSprintData) {
        await this.sprintRepository.updateSprintAsync(newSprintData);
    }

    async finishSprintAsync(sprintId, projectId) {
        const sprint = await this.sprintRepository.getSprintByIdAsync(sprintId);
        const project =
            await this.projectRepository.getProjectByProjectIdAsync(projectId);

        sprint.endDate = Date.now();

        project.currentSprint = undefined;

        project.finishedSprints.push(sprintId);

        await publishEventToTopic(process.env.KAFKA_FINISH_SPRINT_TOPIC, {
            sprintId: sprintId,
        });
        await this.projectRepository.updateProjectAsync(project);
        await this.sprintRepository.updateSprintAsync(sprint);
    }
}

export default SprintService;
