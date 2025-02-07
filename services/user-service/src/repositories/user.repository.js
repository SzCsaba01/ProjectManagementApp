import { User } from '../models/index.js';
import { ADMIN_ROLE } from '../utils/constants.js';

class UserRepository {
    async createUserAsync(user) {
        return await User.create(user);
    }

    async getUsersByIdsAsync(userIds) {
        return await User.find({ _id: { $in: userIds } });
    }

    async getUserByUsernameAsync(username) {
        return await User.findOne({ username: username })
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions',
                },
            })
            .populate('userProfile');
    }

    async getUserByEmailAsync(email) {
        return await User.findOne({ email: email });
    }

    async getUserByUsernameOrEmailAsync(userCredential) {
        return await User.findOne({
            $or: [{ username: userCredential }, { email: userCredential }],
        });
    }

    async getUserByUserIdAndRefreshTokenAsync(userId, refreshToken) {
        return await User.findOne({
            _id: userId,
            refreshToken: refreshToken,
        }).populate({
            path: 'roles',
            populate: {
                path: 'permissions',
            },
        });
    }

    async getUserByIdAsync(userId) {
        return await User.findById(userId)
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions',
                },
            })
            .populate('userProfile');
    }

    async getUserByUsernameAndRegistrationTokenAsync(
        username,
        registrationToken,
    ) {
        return await User.findOne({
            username: username,
            registrationToken: registrationToken,
        });
    }

    async getUsersByRole(role) {
        const result = await User.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roles',
                    foreignField: '_id',
                    as: 'roles',
                },
            },
            {
                $match: {
                    'roles.name': { $eq: role },
                },
            },
            {
                $lookup: {
                    from: 'userprofiles',
                    localField: 'userProfile',
                    foreignField: '_id',
                    as: 'userProfile',
                },
            },
            {
                $unwind: {
                    path: '$userProfile',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        return result;
    }

    async getUsersPaginatedAsync(search, page, numberOfUsers) {
        const filters = {};

        if (search) {
            filters.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(numberOfUsers);

        const result = await User.aggregate([
            { $match: filters },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roles',
                    foreignField: '_id',
                    as: 'roles',
                },
            },
            {
                $match: {
                    'roles.name': { $ne: ADMIN_ROLE },
                },
            },
            {
                $facet: {
                    users: [
                        { $skip: skip },
                        { $limit: parseInt(numberOfUsers) },
                        {
                            $lookup: {
                                from: 'userprofiles',
                                localField: 'userProfile',
                                foreignField: '_id',
                                as: 'userProfile',
                            },
                        },
                        {
                            $unwind: {
                                path: '$userProfile',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    totalNumberOfUsers: [{ $count: 'count' }],
                },
            },
        ]);

        const users = result[0].users;
        const totalNumberOfUsers = result[0]?.totalNumberOfUsers[0]?.count || 0;
        return { users: users, totalNumberOfUsers: totalNumberOfUsers };
    }

    async getUsersByProjectIdAsync(projectId) {
        return await User.find({ projects: projectId })
            .populate('userProfile')
            .populate('roles');
    }

    async updateUserAsync(user) {
        const { _id, ...userWithoutId } = user;
        await User.updateOne({ _id: user._id }, { $set: userWithoutId });
    }

    async updateUsersAsync(users) {
        const bulkOps = users.map((user) => ({
            updateOne: {
                filter: { _id: user._id },
                update: user,
            },
        }));

        return await User.bulkWrite(bulkOps);
    }

    async deleteUserByUserIdAsync(userId) {
        await User.deleteOne({ _id: userId });
    }
}

export default UserRepository;
