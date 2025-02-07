import { createContainer, asClass } from 'awilix';

import {
    BlacklistedTokenRepository,
    RoleRepository,
    UserRepository,
    UserProfileRepository,
} from '../repositories/index.js';
import {
    AuthService,
    EmailService,
    UserService,
    UserProfileService,
} from '../services/index.js';
import {
    AuthController,
    UserController,
    UserProfileController,
} from '../controllers/index.js';
import Scheduler from '../scheduler/scheduler.js';

const container = createContainer();

container.register({
    //Repositories
    userRepository: asClass(UserRepository).scoped(),
    userProfileRepository: asClass(UserProfileRepository).scoped(),
    blacklistedTokenRepository: asClass(BlacklistedTokenRepository).scoped(),
    roleRepository: asClass(RoleRepository).scoped(),

    //Services
    authService: asClass(AuthService).scoped(),
    userService: asClass(UserService).scoped(),
    userProfileService: asClass(UserProfileService).scoped(),
    emailService: asClass(EmailService).singleton(),

    //Controller
    authController: asClass(AuthController).scoped(),
    userController: asClass(UserController).scoped(),
    userProfileController: asClass(UserProfileController).scoped(),

    //Scheduler
    scheduler: asClass(Scheduler).singleton(),
});

export default container;
