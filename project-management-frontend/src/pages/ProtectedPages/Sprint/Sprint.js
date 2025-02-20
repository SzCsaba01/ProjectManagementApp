import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DropContainer from '../../../components/dropContainer/DropContainer';
import TaskCard from '../../../components/taskCard/TaskCard';
import TaskDetails from '../../../components/taskDetails/TaskDetails';
import {
    deleteTask,
    getCurrentSprintTasksBySprintId,
} from '../../../services/task.service';
import { getUsersByProject } from '../../../services/user.service';
import { TaskStatus } from '../../../utils/enums.util';
import './Sprint.css';
import { updateTasksIndex } from '../../../services/task.service';
import { canTaskBeMoved } from '../../../utils/helpers.util';
import useWebSocket from '../../../hooks/useWebSocket';
import CustomIcon from '../../../components/icon/CustomIcon';
import EditSprintModal from '../../../components/editSprintModal/EditSprintModal';
import FinishSprintModal from '../../../components/finishSprintModal/FinishSprintModal';
import { getSprint } from '../../../services/sprint.service';

const Sprint = () => {
    const { userId } = useSelector((state) => state.user);
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
    const [selectedTask, setSelectedTask] = useState(null);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isEditSprintModalShown, setIsEditSprintModalShown] = useState(false);
    const [isFinishSprintModalShown, setIsFinisSprintModalShown] =
        useState(false);
    const [sprint, setSprint] = useState(false);

    const containersRef = useRef(containers);
    const usersRef = useRef(users);
    const selectedTaskRef = useRef(selectedTask);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
    );

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
            containersRef.current = groupedTasks;
        };
        if (projectId && currentSprintId) {
            fetchData();
        }
    }, [projectId, currentSprintId]);

    useEffect(() => {
        const fetchSprint = async () => {
            const sprintData = await getSprint(currentSprintId);

            setSprint(sprintData);
        };
        if (currentSprintId) {
            fetchSprint();
        }
    }, [currentSprintId]);

    useEffect(() => {
        usersRef.current = users;
    }, [users]);

    useEffect(() => {
        selectedTaskRef.current = selectedTask;
    }, [selectedTask]);

    const handleMessage = (message) => {
        switch (message.type) {
            case 'UPDATE_TASK': {
                handleUpdateTask(message.task);
                break;
            }
            case 'UPDATE_TASKS': {
                const updatedTasks = message.tasks;
                if (selectedTask) {
                    const currentlySelectedTask = updatedTasks.find(
                        (task) => task._id === selectedTaskRef._id,
                    );
                    if (currentlySelectedTask) {
                        setSelectedTask(currentlySelectedTask);
                    }
                }
                setContainers((prev) => {
                    const oldDraggedTaskContainer = findContainer(
                        message.draggedTaskId,
                    );

                    const filteredTasks = prev[oldDraggedTaskContainer].filter(
                        (task) => task._id !== message.draggedTaskId,
                    );

                    containersRef.current = {
                        ...prev,
                        [oldDraggedTaskContainer]: filteredTasks,
                        [updatedTasks[0].status]: updatedTasks,
                    };

                    return {
                        ...prev,
                        [oldDraggedTaskContainer]: filteredTasks,
                        [updatedTasks[0].status]: updatedTasks,
                    };
                });
                break;
            }
            default: {
                console.error('Invalid message');
                break;
            }
        }
    };

    const { sendMessage } = useWebSocket(
        `${process.env.REACT_APP_WS_BACKEND_APP_API_URL}`,
        'SPRINT',
        currentSprintId,
        userId,
        handleMessage,
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const { id: activeId } = active;
        const { id: overId } = over;

        const overContainer = findContainer(overId);
        const activeTask = containersRef.current[overContainer].find(
            (task) => task._id === activeId,
        );

        if (!activeTask) {
            setContainers((prev) => {
                const draggedTask = findTask(
                    draggingItem.container,
                    draggingItem.taskId,
                );

                prev[draggedTask.status].push(draggedTask);
                prev[draggingItem.container] = prev[
                    draggingItem.container
                ].filter((task) => task._id !== draggedTask._id);

                containersRef.current = {
                    ...prev,
                };
                return {
                    ...prev,
                };
            });
            setDraggingItem(null);
            return;
        }

        const activeContainer = activeTask.status;

        if (activeContainer !== overContainer) {
            activeTask.status = overContainer;
        }

        const containerTasks = containers[overContainer];
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

        handleUpdateTasksIndex(reorderedTasks, draggingItem.taskId);
        setDraggingItem(null);
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

        const activeTask = containersRef.current[activeContainer].find(
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

            containersRef.current = {
                ...prev,
                [activeContainer]: updatedActiveContainer,
                [overContainer]: updatedOverContainer,
            };
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
        if (id in containersRef.current) {
            return id;
        }
        return Object.keys(containersRef.current).find((container) =>
            containersRef.current[container].some((task) => task._id === id),
        );
    };

    const findTask = (containerName, taskId) => {
        const task = containersRef.current[containerName].find(
            (task) => task._id === taskId,
        );
        return task;
    };

    const handleUpdateTasksIndex = async (tasks, draggedTaskId) => {
        await updateTasksIndex(tasks, draggedTaskId, 'SPRINT', currentSprintId);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskDetails = () => {
        setSelectedTask(null);
    };

    const handleOnDelete = async (task) => {
        await deleteTask(task._id);
        setSelectedTask(null);
        setContainers((prev) => {
            const filteredContainer = prev[task.status].filter(
                (containerTask) => containerTask._id !== task._id,
            );

            containersRef.current = {
                ...prev,
                [task.status]: filteredContainer,
            };

            return {
                ...prev,
                [task.status]: filteredContainer,
            };
        });
    };

    const handleUpdateTask = (updatedTask) => {
        const prevTaskContainer = findContainer(updatedTask._id);

        updatedTask.assignee = usersRef.current.find(
            (user) => user.userId === updatedTask.assigneeId,
        );
        updatedTask.creator = usersRef.current.find(
            (user) => user.userId === updatedTask.creatorId,
        );

        setContainers((prevContainers) => {
            const newContainers = { ...prevContainers };

            newContainers[prevTaskContainer] = newContainers[
                prevTaskContainer
            ].filter((task) => task._id !== updatedTask._id);

            newContainers[updatedTask.status].push(updatedTask);

            containersRef.current = newContainers;

            return newContainers;
        });
        if (selectedTaskRef.current) {
            setSelectedTask(updatedTask);
        }
    };

    const handleEditSprintModalChange = () => {
        setIsEditSprintModalShown(!isEditSprintModalShown);
    };

    const handleFinishSprintModalChange = () => {
        setIsFinisSprintModalShown(!isFinishSprintModalShown);
    };

    const handleUpdateSprint = (sprintData) => {
        handleEditSprintModalChange();
        setSprint(sprintData);
    };

    const handleFinishSprint = () => {
        handleFinishSprintModalChange();
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return 'N/A';
        }

        let date;

        date = new Date(dateValue);

        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
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
                                <div className="sprint-board-header">
                                    {sprint && (
                                        <div className="sprint-details-section">
                                            <h2>{sprint.name}</h2>
                                            <span>
                                                <h4>Start Date:</h4>
                                                {formatDate(sprint.startDate)}
                                            </span>
                                            <span>
                                                <h4>Planned End Date:</h4>
                                                {formatDate(
                                                    sprint.plannedEndDate,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="edit-section">
                                        <div
                                            className="edit-button"
                                            onClick={
                                                handleEditSprintModalChange
                                            }
                                        >
                                            <CustomIcon
                                                size="medium"
                                                name="edit"
                                                className="edit-icon"
                                            />
                                            <span>Edit Sprint </span>
                                        </div>
                                        <div
                                            className="edit-button"
                                            onClick={
                                                handleFinishSprintModalChange
                                            }
                                        >
                                            <CustomIcon
                                                size="medium"
                                                name="flag"
                                                className="finish-icon"
                                            />
                                            <span>Finish Sprint </span>
                                        </div>
                                    </div>
                                </div>

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
                                    type={'SPRINT'}
                                    sprintId={currentSprintId}
                                    backlogId={backlogId}
                                    onDelete={handleOnDelete}
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
                                id={draggingItem.taskId}
                                isDragging={true}
                                task={findTask(
                                    draggingItem.container,
                                    draggingItem.taskId,
                                )}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
                {isEditSprintModalShown && (
                    <EditSprintModal
                        sprint={sprint}
                        onUpdateSprint={handleUpdateSprint}
                        onClose={handleEditSprintModalChange}
                    />
                )}
                {isFinishSprintModalShown && (
                    <FinishSprintModal
                        sprint={sprint}
                        projectId={projectId}
                        onFinishSprint={handleFinishSprint}
                        onClose={handleFinishSprintModalChange}
                    />
                )}
            </>
        );
    }
};

export default Sprint;
