import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigate } from './config/axios.config';
import { Provider } from 'react-redux';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import './App.css';
import store from './context/store';
import routes from './config/routes.config';
import NotificationBar from './components/notificationBar/NotificationBar';
import useFetchUser from './hooks/useFetchUser.hook';
import LoadingPage from './pages/LoadinPage/LoadingPage';

function AppContent() {
    const loading = useFetchUser();
    const navigate = useNavigate();

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate]);

    if (loading) {
        return <LoadingPage />;
    }

    const renderRoutes = (routes) => {
        return routes.map(
            ({
                path,
                component,
                allowedRoles,
                layout: Layout = React.Fragment,
                routeGuard: RouteGuard = ({ children }) => <>{children}</>,
                children,
            }) => {
                return (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <Layout>
                                <RouteGuard allowedRoles={allowedRoles}>
                                    {component}
                                </RouteGuard>
                            </Layout>
                        }
                    >
                        {children && <Route>{renderRoutes(children)}</Route>}
                    </Route>
                );
            },
        );
    };

    return (
        <>
            <NotificationBar />
            <Routes>
                {renderRoutes(routes)}
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AppContent />
            </Router>
        </Provider>
    );
}

export default App;
