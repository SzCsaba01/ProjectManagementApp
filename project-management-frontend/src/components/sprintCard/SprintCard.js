import './SprintCard.css';

const SprintCard = ({ sprint, ...props }) => {
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

    return (
        <div {...props} className="sprint-history-item">
            <div className="sprint-history-item-header">
                <h2>{sprint.name}</h2>
            </div>
            <div className="sprint-history-item-content">
                <p>
                    <strong>Start Date: </strong>
                    {formatDate(sprint.startDate)}
                </p>
                <p>
                    <strong>Planned End Date: </strong>
                    {formatDate(sprint.plannedEndDate)}
                </p>
                <p>
                    <strong>End Date: </strong>
                    {formatDate(sprint.endDate)}
                </p>
            </div>
        </div>
    );
};

export default SprintCard;
