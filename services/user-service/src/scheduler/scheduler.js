import schedule from 'node-schedule';
import jobs from './jobs.js';

class Scheduler {
    constructor({ userService }) {
        this.userService = userService;
    }

    start() {
        const jobList = jobs(this.userService);
        jobList.forEach((job) => {
            schedule.scheduleJob(job.schedule, job.task);
            console.log(`Scheduled job: ${job.name}`);
        });
    }
}

export default Scheduler;
