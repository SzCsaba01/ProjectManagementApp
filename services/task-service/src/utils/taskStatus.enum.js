const TaskStatus = Object.freeze({
    NotStarted: Symbol('NotStarted'),
    InPlanning: Symbol('InPlanning'),
    InProgress: Symbol('InProgress'),
    Completed: Symbol('Completed'),
    Finished: Symbol('Finished'),
});

export default TaskStatus;
