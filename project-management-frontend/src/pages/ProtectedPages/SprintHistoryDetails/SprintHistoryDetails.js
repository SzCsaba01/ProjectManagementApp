import './SprintHistoryDetails.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomIcon from '../../../components/icon/CustomIcon';
import TaskCard from '../../../components/taskCard/TaskCard';
import TaskDetails from '../../../components/taskDetails/TaskDetails';
import { getTasksBySprintId } from '../../../services/task.service';
import { getUsersByProject } from '../../../services/user.service';
import ConfirmationPopup from '../../../components/confirmationPopup/ConfirmationPopup';
import { deleteSprint } from '../../../services/sprint.service';

const SprintHistoryDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId } = useSelector((state) => state.project);
    const { sprint } = location.state || {};

    const [users, setUsers] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

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

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getUsersByProject(projectId);
            const allUsers = [...userData.users, userData.owner];
            setUsers(allUsers);

            const tasks = await getTasksBySprintId(sprint._id);

            tasks.forEach((task) => {
                task.assignee = allUsers.find(
                    (user) => user.userId === task.assigneeId,
                );
                task.creator = allUsers.find(
                    (user) => user.userId === task.creatorId,
                );
            });
            setTasks(tasks);
        };
        if (!sprint) {
            navigate('../');
        } else {
            fetchData();
        }
    }, [sprint, projectId, navigate]);

    const handleDeleteSprint = async () => {
        await deleteSprint(sprint._id, projectId);
        handleChangeConfirmation();
        navigate('/home/sprint-history');
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskDetails = () => {
        setSelectedTask(null);
    };

    const handleChangeConfirmation = () => {
        setShowConfirmation(!showConfirmation);
    };

    return (
        <>
            <div className="sprint-history-details-overlay">
                <h1>Sprint Details</h1>
                <div className="sprint-history-details-container">
                    <div className="sprint-history-details">
                        <div className="sprint-details-header">
                            <h2>{sprint.name}</h2>
                            <CustomIcon
                                name="trash"
                                size="medium"
                                className="delete-icon"
                                onClick={() => handleChangeConfirmation()}
                                title="Delete Sprint"
                            />
                        </div>
                        <div className="sprint-details-info">
                            <p>
                                <strong>Start Date:</strong>{' '}
                                {formatDate(sprint.startDate)}
                            </p>
                            <p>
                                <strong>End Date:</strong>{' '}
                                {formatDate(sprint.endDate)}
                            </p>
                            {sprint.description && (
                                <p>
                                    <strong>Description:</strong>{' '}
                                    {sprint.description}
                                </p>
                            )}
                        </div>
                        <div className="sprint-details-tasks">
                            <h3>Tasks</h3>
                            {tasks && tasks.length ? (
                                <div className="task-list">
                                    {tasks.map((task) => (
                                        <TaskCard
                                            handleTaskClick={handleTaskClick}
                                            key={task._id}
                                            id={task._id}
                                            task={task}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p>No tasks found for this sprint.</p>
                            )}
                        </div>
                    </div>
                    {selectedTask && (
                        <TaskDetails
                            users={users}
                            task={selectedTask}
                            readOnly={true}
                            onClose={handleCloseTaskDetails}
                        />
                    )}
                </div>
            </div>

            {showConfirmation && (
                <ConfirmationPopup
                    message="Are you sure you want to delete the sprint?"
                    onCancel={handleChangeConfirmation}
                    onConfirm={handleDeleteSprint}
                />
            )}
        </>
    );
};

export default SprintHistoryDetails;
