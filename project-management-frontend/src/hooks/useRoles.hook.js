import { useSelector } from 'react-redux';

const useRoles = (requriedRoles) => {
    const roles = useSelector((state) => state.user.roles);

    if (!roles) {
        return false;
    }

    const hasRole = requriedRoles.some((requriedRole) =>
        roles.includes(requriedRole),
    );

    return hasRole;
};

export default useRoles;
