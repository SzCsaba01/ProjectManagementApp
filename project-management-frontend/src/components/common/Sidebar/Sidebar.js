import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { Link, NavLink } from 'react-router-dom';
import CustomIcon from '../../icon/CustomIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectByProjectId } from '../../../services/project.service';
import { setCurrentProjectDetailsAction } from '../../../context/project.actions';

const Sidebar = () => {
    const dispatch = useDispatch();
    const [collapsed, setCollapsed] = useState(true);
    const [projectName, setProjectName] = useState(null);

    const { projectId } = useSelector((state) => state.project);

    useEffect(() => {
        const fetchSelectedProjectData = async (projectId) => {
            const project = await getProjectByProjectId(projectId);
            setProjectName(project.name);
            dispatch(
                setCurrentProjectDetailsAction(
                    projectId,
                    project.backlogId,
                    project.currentSprintId,
                    project.finishedSprintIds,
                ),
            );
        };

        if (projectId) {
            fetchSelectedProjectData(projectId);
        }
    }, [projectId, dispatch]);

    const toggleSidebar = () => {
        setCollapsed((prev) => !prev);
    };

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <CustomIcon
                    name="angle-double-left"
                    size="medium"
                    className={`sidebar-toggle-icon ${collapsed ? 'collapsed' : ''}`}
                    onClick={toggleSidebar}
                />
            </div>
            <ul className="sidebar-menu">
                {projectName && (
                    <li className="sidebar-item">
                        <Link
                            to="project-details"
                            title={projectName}
                            state={{
                                projectDetails: {
                                    projectName: projectName,
                                    projectId: projectId,
                                },
                            }}
                            className="sidebar-link selected-project"
                        >
                            <CustomIcon
                                name="project-diagram"
                                className="sidebar-item-icon"
                                size="small"
                            />
                            <span className="sidebar-item-message">
                                {projectName}
                            </span>
                        </Link>
                    </li>
                )}
                <li className="sidebar-item">
                    <NavLink
                        to="sprint"
                        title="Current Sprint"
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link active' : 'sidebar-link'
                        }
                    >
                        <CustomIcon
                            name="tasks"
                            size="small"
                            className="sidebar-item-icon"
                        />
                        <span className="sidebar-item-message">
                            Current Sprint
                        </span>
                    </NavLink>
                </li>
                <li className="sidebar-item">
                    <NavLink
                        to="backlog"
                        title="Backlog"
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link active' : 'sidebar-link'
                        }
                    >
                        <CustomIcon
                            name="clipboard-list"
                            size="small"
                            className="sidebar-item-icon"
                        />
                        <span className="sidebar-item-message">Backlog</span>
                    </NavLink>
                </li>
                <li className="sidebar-item">
                    <NavLink
                        to="sprint-history"
                        title="Sprint History"
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link active' : 'sidebar-link'
                        }
                    >
                        <CustomIcon
                            name="history"
                            size="small"
                            className="sidebar-item-icon"
                        />
                        <span className="sidebar-item-message">
                            Sprint History
                        </span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
