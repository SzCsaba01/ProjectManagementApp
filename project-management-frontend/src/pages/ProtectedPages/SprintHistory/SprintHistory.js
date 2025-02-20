import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SprintCard from '../../../components/sprintCard/SprintCard';
import { getSprintsByIds } from '../../../services/sprint.service';
import './SprintHistory.css';

const SprintHistory = () => {
    const navigate = useNavigate();
    const { projectId, finishedSprintIds } = useSelector(
        (state) => state.project,
    );

    const [sprints, setSprints] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const historyData = await getSprintsByIds(finishedSprintIds);
            setSprints(historyData);
        };
        if (finishedSprintIds) {
            fetchHistory();
        }
    }, [projectId, finishedSprintIds]);

    const handleSprintSelect = async (sprint) => {
        navigate('details', { state: { sprint: sprint } });
    };

    return (
        <div className="sprint-history-overlay">
            <h1>Sprint History</h1>
            <div className="sprint-history-container">
                <div className="sprint-history-list">
                    {sprints.length ? (
                        sprints.map((sprint) => (
                            <SprintCard
                                key={sprint._id}
                                sprint={sprint}
                                onClick={() => handleSprintSelect(sprint)}
                            />
                        ))
                    ) : (
                        <p>No sprint history found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SprintHistory;
