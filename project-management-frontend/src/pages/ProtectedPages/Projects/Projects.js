import { useState, useEffect } from 'react';
import './Projects.css';
import usePermissions from '../../../hooks/usePermissions.hook';
import { MANAGE_ACTION, PROJECT_RESOURCE } from '../../../utils/constants.util';
import {
    getAllProjects,
    getProjectsByMemberId,
} from '../../../services/project.service';
import { useSelector } from 'react-redux';
import CustomIcon from '../../../components/icon/CustomIcon';
import { NavLink } from 'react-router-dom';
import ProjectCard from '../../../components/projectCard/ProjectCard';

const Projects = () => {
    const [projects, setProjects] = useState(null);

    const userId = useSelector((state) => state.user.userId);
    const hasManageProjectsPermission = usePermissions([
        {
            resource: PROJECT_RESOURCE,
            action: MANAGE_ACTION,
        },
    ]);

    useEffect(() => {
        const fetchProjects = async () => {
            if (hasManageProjectsPermission) {
                const projects = await getAllProjects();

                setProjects(projects);
            } else {
                const projects = await getProjectsByMemberId(userId);
                setProjects(projects);
            }
        };

        fetchProjects();
    }, [hasManageProjectsPermission, userId]);

    return (
        <div className="projects-container">
            <h1>Projects</h1>
            <div className="projects-grid-container">
                {hasManageProjectsPermission && (
                    <div className="add-project-section">
                        <NavLink
                            to="../create-project"
                            className="add-project-icon-container"
                        >
                            <CustomIcon name="plus" size="medium" />
                            <span>Create project</span>
                        </NavLink>
                    </div>
                )}
                <div className="project-cards-container">
                    {projects?.map((project) => {
                        return (
                            <ProjectCard
                                key={project.name}
                                projectId={project._id}
                                projectName={project.name}
                            ></ProjectCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Projects;
