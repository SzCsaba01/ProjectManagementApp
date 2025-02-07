import { Role } from '../models/index.js';

class RoleRepository {
    async getRoleByRoleNameAsync(roleName) {
        return await Role.findOne({ name: roleName });
    }
}

export default RoleRepository;
