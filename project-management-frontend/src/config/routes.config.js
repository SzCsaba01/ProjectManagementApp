import ProtectedLayout from '../components/layouts/ProtectedLayout/ProtectedLayout';
import PublicLayout from '../components/layouts/PublicLayout/PublicLayout';
import Backlog from '../pages/ProtectedPages/Backlog/Backlog';
import CreateProject from '../pages/ProtectedPages/CreateProject/CreateProject';
import EditProject from '../pages/ProtectedPages/EditProject/EditProject';
import Home from '../pages/ProtectedPages/Home/Home';
import Profile from '../pages/ProtectedPages/Profile/Profile';
import ProjectDetails from '../pages/ProtectedPages/ProjectDetails/ProjectDetails';
import Projects from '../pages/ProtectedPages/Projects/Projects';
import Sprint from '../pages/ProtectedPages/Sprint/Sprint';
import SprintHistory from '../pages/ProtectedPages/SprintHistory/SprintHistory';
import SprintHistoryDetails from '../pages/ProtectedPages/SprintHistoryDetails/SprintHistoryDetails';
import UserDetails from '../pages/ProtectedPages/UserDetails/UserDetails';
import Users from '../pages/ProtectedPages/Users/Users';
import ChangePassword from '../pages/PublicPages/ChangePassword/ChangePassword';
import EmailVerification from '../pages/PublicPages/EmailVerification/EmailVerification';
import ForgotPassword from '../pages/PublicPages/ForgotPassword/ForgotPassword';
import Login from '../pages/PublicPages/Login/Login';
import Register from '../pages/PublicPages/Register/Register';
import { ADMIN_ROLE } from '../utils/constants.util';
import ProtectedRoute from '../utils/ProtectedRoutes.util';
import PublicRoute from '../utils/PublicRoutes.util';

const routes = [
    //public routes
    {
        path: '/register',
        component: <Register />,
        layout: PublicLayout,
        routeGuard: PublicRoute,
    },
    {
        path: '/login',
        component: <Login />,
        layout: PublicLayout,
        routeGuard: PublicRoute,
    },
    {
        path: '/forgot-password',
        component: <ForgotPassword />,
        layout: PublicLayout,
        routeGuard: PublicRoute,
    },
    {
        path: '/change-password',
        component: <ChangePassword />,
        layout: PublicLayout,
        routeGuard: PublicRoute,
    },
    {
        path: '/verify-email',
        component: <EmailVerification />,
        layout: PublicLayout,
        routeGuard: PublicRoute,
    },

    //protected routes
    {
        path: 'home',
        component: <Home />,
        allowedRoles: ['Admin', 'Manager', 'User'],
        layout: ProtectedLayout,
        routeGuard: ProtectedRoute,
        children: [
            {
                path: 'profile',
                component: <Profile />,
            },
            {
                path: 'users',
                component: <Users />,
                allowedRoles: [ADMIN_ROLE],
            },
            {
                path: 'projects',
                component: <Projects />,
            },
            {
                path: 'create-project',
                component: <CreateProject />,
                allowedRoles: [ADMIN_ROLE],
            },
            {
                path: 'edit-project',
                component: <EditProject />,
                allowedRoles: [ADMIN_ROLE],
            },
            {
                path: 'project-details',
                component: <ProjectDetails />,
            },
            {
                path: 'user-details',
                component: <UserDetails />,
            },
            {
                path: 'backlog',
                component: <Backlog />,
            },
            {
                path: 'sprint',
                component: <Sprint />,
            },
            {
                path: 'sprint-history',
                component: <SprintHistory />,
            },
            {
                path: 'sprint-history/details',
                component: <SprintHistoryDetails />,
            },
        ],
    },
];

export default routes;
