import { useSelector } from 'react-redux';

const usePermissions = (requiredPermissions) => {
    const permissions = useSelector((state) => state.user.permissions);

    if (!permissions) {
        return false;
    }

    const hasPermission = requiredPermissions.every((requiredPermission) =>
        permissions.some(
            (permission) =>
                permission.resource === requiredPermission.resource &&
                permission.action === requiredPermission.action,
        ),
    );

    return hasPermission;
};

export default usePermissions;
