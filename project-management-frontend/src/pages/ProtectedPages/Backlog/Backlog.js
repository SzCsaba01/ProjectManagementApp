import './Backlog.css';
import { useEffect, useState } from 'react';
import DropContainer from '../../../components/dropContainer/DropContainer';
import CustomIcon from '../../../components/icon/CustomIcon';
import {
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

const Backlog = () => {
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] =
        useState(false);
    const [users, setUsers] = useState([]);
    const [containers, setContainers] = useState({
        CurrentSprint: [],
        Blocked: [],
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
    const { projectId, backlogId, currentSprintId } = useSelector(
        (state) => state.project,
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
        };
        fetchData();
    }, [projectId, backlogId]);

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
        console.log('test');
        await updateTasksIndex(tasks, currentSprintId);
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
                                        <CustomIcon name="plus" size="medium" />
                                        <span>Create Sprint</span>
                                    </div>
                                )}
                                <div
                                    className="create-section"
                                    onClick={handleChangeCreateTaskModalStatus}
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
                                                containerName={containerName}
                                                tasks={
                                                    containers[containerName]
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
};

export default Backlog;
