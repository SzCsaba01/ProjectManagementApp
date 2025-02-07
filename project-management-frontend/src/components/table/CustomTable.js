import React from 'react';
import CustomIcon from '../icon/CustomIcon';
import './CustomTable.css';

const CustomTable = React.memo(
    ({
        labels,
        currentPage,
        numberOfPages,
        numberOfElements,
        totalNumberOfElements,
        dataRows,
        onRowClick,
        onPageChange,
    }) => {
        const handleRowClick = (rowIndex, data) => {
            if (onRowClick) {
                onRowClick(rowIndex, data);
            }
        };

        const handlePageChange = (direction) => {
            if (currentPage === 1 && direction === 'prev') {
                return;
            }
            if (currentPage === numberOfPages && direction === 'next') {
                return;
            }
            if (onPageChange) {
                const newPage =
                    direction === 'next' ? currentPage + 1 : currentPage - 1;
                onPageChange(newPage);
            }
        };

        const normalizeString = (label) => {
            return label.toLowerCase().replace(/\s+/g, '');
        };

        const renderCellContent = (data, label) => {
            const normalizedLabel = normalizeString(label);

            const matchingKey = Object.keys(data).find(
                (key) => normalizeString(key) === normalizedLabel,
            );

            if (!matchingKey) {
                return '';
            }

            const cellData = data[matchingKey];

            const isImageUrl =
                typeof cellData === 'string' &&
                cellData.match(/\.(jpeg|jpg|png)$/i);

            if (isImageUrl) {
                return (
                    <img src={cellData} alt={label} className="table-image" />
                );
            }

            return cellData || '-';
        };

        return (
            <table className="custom-table">
                <thead>
                    <tr>
                        {labels.map((label, index) => (
                            <th key={index}>{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dataRows?.map((data, rowIndex) => {
                        return (
                            <tr
                                key={rowIndex}
                                onClick={() =>
                                    onRowClick && handleRowClick(rowIndex, data)
                                }
                                className={onRowClick ? 'clickable-row' : ''}
                            >
                                {labels?.map((label, colIndex) => {
                                    return (
                                        <td key={colIndex}>
                                            {renderCellContent(data, label)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={labels.length}>
                            <div className="table-footer">
                                <div className="table-summary">
                                    <span>
                                        {' '}
                                        Showing{' '}
                                        {(currentPage - 1) * numberOfElements +
                                            1}{' '}
                                        - {currentPage * numberOfElements} of{' '}
                                        {totalNumberOfElements} rows
                                    </span>
                                </div>
                                <div className="table-navigation">
                                    <CustomIcon
                                        className={`table-navigation-button ${currentPage === 1 ? 'disabled' : ''}`}
                                        name="arrow-left"
                                        size="medium"
                                        onClick={() => handlePageChange('prev')}
                                    ></CustomIcon>
                                    <span>
                                        Page {currentPage} of {numberOfPages}
                                    </span>
                                    <CustomIcon
                                        className={`table-navigation-button ${currentPage === numberOfPages ? 'disabled' : ''}`}
                                        name="arrow-right"
                                        size="medium"
                                        onClick={() => handlePageChange('next')}
                                    ></CustomIcon>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    },
);

export default CustomTable;
