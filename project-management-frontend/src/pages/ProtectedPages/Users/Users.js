import { useEffect, useState } from 'react';
import { getUsersPaginated } from '../../../services/user.service';
import CustomTable from '../../../components/table/CustomTable';
import CustomInput from '../../../components/input/CustomInput';
import CustomDropdown from '../../../components/dropdown/CustomDropdown';
import './Users.css';
import useDebounce from '../../../hooks/useDebounce.hook';
import { DEFAULT_PROFILE_IMAGE } from '../../../utils/constants.util';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const navigate = useNavigate();

    const [paginatedUsers, setPaginatedUsers] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [numberOfRows, setNumberOfRows] = useState(5);
    const [numberOfUsers, setNumberOfUsers] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);
    const [totalNumberOfUsers, setTotalNumberOfUsers] = useState(0);

    const labels = [
        'Avatar',
        'Username',
        'Email',
        'First Name',
        'Last Name',
        'Roles',
    ];

    useEffect(() => {
        const fetchPaginatedUsers = async () => {
            const result = await getUsersPaginated(
                debouncedSearch,
                page,
                numberOfRows,
            );
            const totalNumberOfPages = Math.ceil(
                result?.totalNumberOfUsers / numberOfRows,
            );

            result.users.forEach((user) => {
                if (!user.avatar) {
                    user.avatar = DEFAULT_PROFILE_IMAGE;
                }
            });

            setPaginatedUsers(result.users);
            setNumberOfPages(totalNumberOfPages);
            setNumberOfUsers(result.users.length);
            setTotalNumberOfUsers(result?.totalNumberOfUsers);
        };
        fetchPaginatedUsers();
    }, [debouncedSearch, page, numberOfRows, totalNumberOfUsers]);

    const handleSearchChangeDebounced = useDebounce(setDebouncedSearch, 400);

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleNumberOfUsersChange = (number) => {
        if (number > 0 && number <= 15) {
            setNumberOfRows(number);
        }
    };

    const handleRowClick = (rowIndex, data) => {
        navigate('../user-details', { state: { user: data } });
    };

    return (
        <div className="users-container">
            <h1>Users</h1>
            <div className="users-table-container">
                <div className="users-table-options">
                    <div className="search-bar-container">
                        <CustomInput
                            label="Search"
                            onChange={(e) =>
                                handleSearchChangeDebounced(e.target.value)
                            }
                        />
                    </div>

                    <div className="users-pagination-controls">
                        <CustomDropdown
                            label="Users per page"
                            value={numberOfRows}
                            onChange={handleNumberOfUsersChange}
                            options={['5', '10', '15']}
                        />
                    </div>
                </div>

                <CustomTable
                    labels={labels}
                    currentPage={page}
                    numberOfPages={numberOfPages}
                    numberOfElements={numberOfUsers}
                    totalNumberOfElements={totalNumberOfUsers}
                    dataRows={paginatedUsers}
                    onRowClick={handleRowClick}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default Users;
