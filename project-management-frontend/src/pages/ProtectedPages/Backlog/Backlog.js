import './Backlog.css';
import { useEffect, useRef, useState } from 'react';
import DropContainer from '../../../components/dropContainer/DropContainer';
import CustomIcon from '../../../components/icon/CustomIcon';
import {
    deleteTask,
    getTasksByBacklogId,
    updateTasksIndex,
} from '../../../services/task.service';
import { getUsersByProject } from '../../../services/user.service';
import { BacklogStatus } from '../../../utils/enums.util';
import CreateTaskModal from '../../../components/createTaskModal/CreateTaskModal';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import TaskCard from '../../../components/taskCard/TaskCard';
import TaskDetails from '../../../components/taskDetails/TaskDetails';
import CreateSprintModal from '../../../components/createSprintModal/CreateSprintModal';
import { useSelector } from 'react-redux';
import useWebSocket from '../../../hooks/useWebSocket';

const Backlog = () => {
    const { userId } = useSelector((state) => state.user);
    const { projectId, backlogId, currentSprintId } = useSelector(
        (state) => state.project,
    );

    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] =
        useState(false);
    const [users, setUsers] = useState([]);
    const [containers, setContainers] = useState({
        CurrentSprint: [],
        Blocked: [],
    });
    const [selectedTask, setSelectedTask] = useState(null);
    const [draggingItem, setDraggingItem] = useState(null);

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

            const tasks = await getTasksByBacklogId(backlogId);
            const groupedTasks = {
                CurrentSprint: [],
                Blocked: [],
            };

            tasks.forEach((task) => {
                task.assignee = allUsers.find(
                    (user) => user.userId === task.assigneeId,
                );
                task.creator = allUsers.find(
                    (user) => user.userId === task.creatorId,
                );
                groupedTasks[task.backlogStatus].push(task);
            });

            setContainers(groupedTasks);
            setUsers(allUsers);
            containersRef.current = groupedTasks;
        };
        if (projectId && backlogId) {
            fetchData();
        }
    }, [projectId, backlogId]);

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
                        [updatedTasks[0].backlogStatus]: updatedTasks,
                    };

                    return {
                        ...prev,
                        [oldDraggedTaskContainer]: filteredTasks,
                        [updatedTasks[0].backlogStatus]: updatedTasks,
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
        'BACKLOG',
        backlogId,
        userId,
        handleMessage,
    );

    const handleChangeCreateTaskModalStatus = () => {
        setIsCreateTaskModalOpen(!isCreateTaskModalOpen);
    };

    const handleChangeCreateSprintModalStatus = () => {
        setIsCreateSprintModalOpen(!isCreateSprintModalOpen);
    };

    const handleTaskCreated = (newTask) => {
        newTask.assignee = users.find(
            (user) => user.userId === newTask.assigneeId,
        );
        newTask.creator = users.find(
            (user) => user.userId === newTask.creatorId,
        );
        setContainers((prev) => ({
            ...prev,
            [newTask.backlogStatus]: [...prev[newTask.backlogStatus], newTask],
        }));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const { id: activeId } = active;
        const { id: overId } = over;

        const overContainer = findContainer(overId);
        const activeTask = containers[overContainer].find(
            (task) => task._id === activeId,
        );
        const activeContainer = activeTask.backlogStatus;

        if (activeContainer !== overContainer) {
            activeTask.backlogStatus = overContainer;
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

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setContainers((prev) => {
            const activeTask = prev[activeContainer].find(
                (task) => task._id === activeId,
            );

            if (!activeTask) return prev;

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
        await updateTasksIndex(
            tasks,
            draggedTaskId,
            'BACKLOG',
            currentSprintId,
            backlogId,
        );
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskDetails = () => {
        setSelectedTask(null);
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

            newContainers[updatedTask.backlogStatus].push(updatedTask);

            containersRef.current = newContainers;

            return newContainers;
        });
        if (selectedTaskRef.current) {
            setSelectedTask(updatedTask);
        }
    };

    const handleOnDelete = async (task) => {
        await deleteTask(task._id);
        setSelectedTask(null);
        setContainers((prev) => {
            const filteredContainer = prev[task.backlogStatus].filter(
                (containerTask) => containerTask._id !== task._id,
            );

            containersRef.current = {
                ...prev,
                [task.backlogStatus]: filteredContainer,
            };

            return {
                ...prev,
                [task.backlogStatus]: filteredContainer,
            };
        });
    };

    if (!projectId) {
        return (
            <div>
                {' '}
                <h2>There's no selected project</h2>
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
                    <div className="backlog-overlay">
                        <h1>Backlog</h1>
                        <div className="backlog-container">
                            <div className="backlog-board">
                                <div
                                    className={`backlog-actions ${currentSprintId ? 'single' : ''}`}
                                >
                                    {!currentSprintId && (
                                        <div
                                            className="create-section"
                                            onClick={
                                                handleChangeCreateSprintModalStatus
                                            }
                                        >
                                            <CustomIcon
                                                name="plus"
                                                size="medium"
                                            />
                                            <span>Create Sprint</span>
                                        </div>
                                    )}
                                    <div
                                        className="create-section"
                                        onClick={
                                            handleChangeCreateTaskModalStatus
                                        }
                                    >
                                        <CustomIcon name="plus" size="medium" />
                                        <span>Create Task</span>
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
                                                    <CustomIcon
                                                        name={
                                                            BacklogStatus[
                                                                containerName
                                                            ].icon
                                                        }
                                                    />
                                                    <h3 className="container-name">
                                                        {
                                                            BacklogStatus[
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
                                    sprintId={currentSprintId}
                                    type="BACKLOG"
                                    task={selectedTask}
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
                {isCreateTaskModalOpen && (
                    <CreateTaskModal
                        onClose={handleChangeCreateTaskModalStatus}
                        users={users}
                        onTaskCreated={handleTaskCreated}
                    />
                )}
                {isCreateSprintModalOpen && !currentSprintId && (
                    <CreateSprintModal
                        backlogId={backlogId}
                        onClose={handleChangeCreateSprintModalStatus}
                    />
                )}
            </>
        );
    }
};

export default Backlog;
