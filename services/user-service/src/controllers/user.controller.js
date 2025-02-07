import { ChangePasswordRequestDTO, RegisterRequestDTO } from '../dtos/index.js';

class UserController {
    constructor({ userService }) {
        this.userService = userService;
    }

    async register(req, res, next) {
        try {
            const registerDTO = new RegisterRequestDTO(
                ...Object.values(req.body),
            );
            await this.userService.registerAsync(registerDTO);
            res.status(201).json({
                message: 'Successfully registered! Please Verify your email!',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserData(req, res, next) {
        try {
            const accessToken = req.cookies.accessToken;

            const result = await this.userService.getUserDataAsync(accessToken);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async getManagers(_req, res, next) {
        try {
            const result = await this.userService.getManagersAsync();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAllUsersForProject(_req, res, next) {
        try {
            const result = await this.userService.getAllUsersForProjectAsync();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUsersPaginated(req, res, next) {
        try {
            const search = req.query.search;
            const page = req.query.page;
            const numberOfUsers = req.query.numberOfUsers;

            const result = await this.userService.getUsersPaginatedAsync(
                search,
                page,
                numberOfUsers,
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUsersByProjectId(req, res, next) {
        try {
            const projectId = req.query.projectId;
            const result =
                await this.userService.getUsersByProjectIdAsync(projectId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async sendForgotPasswordEmail(req, res, next) {
        try {
            await this.userService.sendForgotPasswordEmailAsync(req.body.email);
            res.status(200).json({
                message: 'Check your emails to reset your password!',
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const changePasswordDTO = new ChangePasswordRequestDTO(
                ...Object.values(req.body),
            );
            await this.userService.changePasswordAsync(changePasswordDTO);
            res.status(200).json({
                message: 'Successfully changed your password!',
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmailByRegistrationToken(req, res, next) {
        try {
            await this.userService.verifyEmailByRegistrationTokenAsync(
                req.query.token,
            );
            res.status(200).json({
                message: 'Successfully verified your Email!',
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyIfUserExistsByForgotPasswordToken(req, res, next) {
        try {
            await this.userService.verifyIfUserExistsByForgotPasswordTokenAsync(
                req.query.token,
            );
            res.status(200);
        } catch (error) {
            next(error);
        }
    }

    async setSelectedProject(req, res, next) {
        try {
            const data = req.body;

            await this.userService.setSelectedProjectAsync(data);

            res.status(200).json({
                message: 'Successfully setted current project!',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
