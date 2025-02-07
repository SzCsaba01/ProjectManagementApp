import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DropContainer from '../../../components/dropContainer/DropContainer';
import TaskCard from '../../../components/taskCard/TaskCard';
import TaskDetails from '../../../components/taskDetails/TaskDetails';
import { getCurrentSprintTasksBySprintId } from '../../../services/task.service';
import { getUsersByProject } from '../../../services/user.service';
import { TaskStatus } from '../../../utils/enums.util';
import './Sprint.css';
import { updateTasksIndex } from '../../../services/task.service';
import { canTaskBeMoved } from '../../../utils/helpers.util';

const Sprint = () => {
    const { projectId, backlogId, currentSprintId } = useSelector(
        (state) => state.project,
    );

    const [users, setUsers] = useState([]);
    const [containers, setContainers] = useState({
        NotStarted: [],
        InPlanning: [],
        InProgress: [],
        Completed: [],
        Finished: [],
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
    );

    const [selectedTask, setSelectedTask] = useState(null);

    const [draggingItem, setDraggingItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getUsersByProject(projectId);
            const allUsers = [...userData.users, userData.owner];

            const tasks =
                await getCurrentSprintTasksBySprintId(currentSprintId);
            const groupedTasks = {
                NotStarted: [],
                InPlanning: [],
                InProgress: [],
                Completed: [],
                Finished: [],
            };

            tasks.forEach((task) => {
                task.assignee = allUsers.find(
                    (user) => user.userId === task.assigneeId,
                );
                task.creator = allUsers.find(
                    (user) => user.userId === task.creatorId,
                );
                groupedTasks[task.status].push(task);
            });

            setUsers(allUsers);
            setContainers(groupedTasks);
        };
        fetchData();
    }, [projectId, currentSprintId]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const { id: activeId } = active;
        const { id: overId } = over;

        const overContainer = findContainer(overId);
        const activeTask = containers[overContainer].find(
            (task) => task._id === activeId,
        );
        const activeContainer = activeTask.status;

        if (activeContainer !== overContainer) {
            activeTask.status = overContainer;
        }

        setContainers((prev) => {
            const containerTasks = prev[overContainer];
            const activeIndex = containerTasks.findIndex(
                (task) => task._id === activeId,
            );
            const overIndex = containerTasks.findIndex(
                (task) => task._id === overId,
            );

            const reorderedTasks = arrayMove(
                containerTasks,
                activeIndex,
                overIndex,
            );

            reorderedTasks.forEach((task, index) => {
                task.index = index;
            });

            handleUpdateTasksIndex(reorderedTasks);

            return {
                ...prev,
                [overContainer]: reorderedTasks,
            };
        });
    };

    const handleDragStart = (event) => {
        const taskId = event.active.id;
        const container = findContainer(taskId);

        setDraggingItem({ taskId: taskId, container: container });
    };

    const handleDragOver = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        const activeTask = containers[activeContainer].find(
            (task) => task._id === activeId,
        );

        if (!canTaskBeMoved(overContainer, activeTask)) {
            return;
        }

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setContainers((prev) => {
            if (!activeTask) {
                return prev;
            }

            const updatedActiveContainer = prev[activeContainer].filter(
                (task) => task._id !== activeId,
            );

            const updatedOverContainer = [...prev[overContainer], activeTask];

            return {
                ...prev,
                [activeContainer]: updatedActiveContainer,
                [overContainer]: updatedOverContainer,
            };
        });

        setDraggingItem((prev) => ({
            ...prev,
            container: overContainer,
        }));
    };

    const findContainer = (id) => {
        if (id in containers) {
            return id;
        }
        return Object.keys(containers).find((container) =>
            containers[container].some((task) => task._id === id),
        );
    };

    const findTask = (containerName, taskId) => {
        const task = containers[containerName].find(
            (task) => task._id === taskId,
        );
        return task;
    };

    const handleUpdateTasksIndex = async (tasks) => {
        await updateTasksIndex(tasks);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskDetails = () => {
        setSelectedTask(null);
    };

    const handleUpdateTask = (updatedTask) => {
        updatedTask.assignee = users.find(
            (user) => user.userId === updatedTask.assigneeId,
        );
        updatedTask.creator = users.find(
            (user) => user.userId === updatedTask.creatorId,
        );

        setContainers((prevContainers) => {
            const newContainers = { ...prevContainers };

            newContainers[updatedTask.backlogStatus] = newContainers[
                updatedTask.backlogStatus
            ].filter((task) => task._id !== updatedTask._id);
            newContainers[updatedTask.backlogStatus].push(updatedTask);

            return newContainers;
        });
        setSelectedTask(updatedTask);
    };

    if (!currentSprintId) {
        return (
            <div>
                <h2>There's no started sprint</h2>
            </div>
        );
    } else {
        return (
            <>
                <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                >
                    <div className="sprint-overlay">
                        <h1>Current Sprint</h1>
                        <div className="sprint-container">
                            <div className="sprint-board">
                                <div className="task-drop-containers">
                                    {Object.keys(containers).map(
                                        (containerName) => (
                                            <div
                                                key={containerName}
                                                className="task-drop-container"
                                            >
                                                <div className="container-title">
                                                    <h3 className="container-name">
                                                        {
                                                            TaskStatus[
                                                                containerName
                                                            ].label
                                                        }
                                                    </h3>
                                                </div>
                                                <DropContainer
                                                    containerName={
                                                        containerName
                                                    }
                                                    tasks={
                                                        containers[
                                                            containerName
                                                        ]
                                                    }
                                                    handleTaskClick={
                                                        handleTaskClick
                                                    }
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            {selectedTask && (
                                <TaskDetails
                                    users={users}
                                    onClose={handleCloseTaskDetails}
                                    task={selectedTask}
                                    onTaskModified={handleUpdateTask}
                                    backlogId={backlogId}
                                />
                            )}
                        </div>
                    </div>
                    <DragOverlay
                        dropAnimation={{
                            duration: 200,
                            easing: 'ease',
                        }}
                    >
                        {draggingItem ? (
                            <TaskCard
                                id={draggingItem.taskid}
                                isDragging={true}
                                task={findTask(
                                    draggingItem.container,
                                    draggingItem.taskId,
                                )}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </>
        );
    }
};

export default Sprint;
