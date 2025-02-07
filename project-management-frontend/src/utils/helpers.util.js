import { TaskStatus } from './enums.util';

export const canTaskBeMoved = (containerName, task) => {
    const currentIndex = TaskStatus[task.status].index;

    const newIndex = TaskStatus[containerName].index;

    if (Math.abs(currentIndex - newIndex) > 1) {
        return false;
    }
    return true;
};
