export const TaskCategory = Object.freeze({
    Bugfix: { value: Symbol('Bugfix'), label: 'Bugfix', icon: 'bug' },
    Hotfix: {
        value: Symbol('Hotfix'),
        label: 'Hotfix',
        icon: 'exclamation-triangle',
    },
    Feature: { value: Symbol('Feature'), label: 'Feature', icon: 'cogs' },
});

export const BacklogStatus = Object.freeze({
    CurrentSprint: {
        value: Symbol('CurrentSprint'),
        label: 'Current Sprint',
        icon: 'arrow-alt-circle-right',
    },
    Blocked: {
        value: Symbol('Blocked'),
        label: 'Blocked',
        icon: 'ban',
    },
});

export const TaskPriority = Object.freeze({
    Low: { value: Symbol('Low'), label: 'Low', icon: 'circle' },
    Medium: { value: Symbol('Medium'), label: 'Medium', icon: 'circle-dot' },
    High: { value: Symbol('High'), label: 'High', icon: 'circle-exclamation' },
});

export const TaskStatus = Object.freeze({
    NotStarted: { value: Symbol('NotStarted'), label: 'Not Started', index: 0 },
    InPlanning: { value: Symbol('InPlanning'), label: 'In Planning', index: 1 },
    InProgress: { value: Symbol('InProgress'), label: 'In Progress', index: 2 },
    Completed: { value: Symbol('Completed'), label: 'Completed', index: 3 },
    Finished: { value: Symbol('Finished'), label: 'Finished', index: 4 },
});
