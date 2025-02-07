import { LoginRequestDTO } from '../dtos/index.js';

class AuthController {
    constructor({ authService }) {
        this.authService = authService;
    }

    async login(req, res, next) {
        try {
            const authDTO = new LoginRequestDTO(...Object.values(req.body));
            const result = await this.authService.loginAsync(authDTO, res);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const accessToken = req.cookies.accessToken;
            await this.authService.logout(accessToken, res);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;

            await this.authService.refreshAccessTokenAsync(refreshToken, res);
            res.status(200).send();
        } catch (error) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            next(error);
        }
    }
}

export default AuthController;
