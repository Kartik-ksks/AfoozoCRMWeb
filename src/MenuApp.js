import React, { useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Box } from 'grommet';

import { DashboardProvider } from './context/dashboard';
import { ResponsiveContext } from './context/responsive';
import { SessionContext } from './context/session';

import { Sidebar } from './sidebar';

import { Topbar } from './components';
import { Login } from './pages';
import { MenuProvider } from './context/menu';

import { LoadingLayer } from './components/LoadingLayer';
import { AdminRoutes, ManagerRoutes, UserRoutes } from './pages/routes';
import getMenuDataForRole from './context/menu/menuData';
import FeedbackForm from './pages/feedback/feedbackForm';


const MenuApp = ({ themeMode, toggleThemeMode }) => {
    const navigate = useNavigate();
    const {
        client,
        loggedIn,
        setLoggedIn,
        setSessionExpired,
        restoredSession,
        setRestoredSession,
        userRole,
        setUserRole,
    } = useContext(SessionContext);
    const { isBreakSidebar, isMobile, isPortrait } = useContext(ResponsiveContext);
    const [showSidebar, setShowSidebar] = useState(!isMobile);
    const [menuData, setMenuData] = useState([]);

    const updateRole = useCallback(() => {
        setUserRole(client.session.role);
    }, [setUserRole]);

    useEffect(() => {
        if (restoredSession) {
            if (loggedIn) {
                setRestoredSession(false);
                return;
            }
            if (loggedIn === null) {
                // If "logged in" via a restored session from localStorage, see if
                // the session is still valid. If not, return to login screen.
                client.testRestoredSession().then((works) => {
                    setLoggedIn(works);
                    setRestoredSession(false);
                    if (works) {
                        updateRole();
                    }
                    else {
                        handleLogout();
                    }
                });
            }
        }
    }, [
        loggedIn,
        client,
        restoredSession,
        setLoggedIn,
        setRestoredSession,
    ]);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const onLogin = (username, password) => {
        return client.login(username, password).then((res) => {
            if (res.status === 200) {
                setLoggedIn(true);
                setSessionExpired(false);
                setUserRole(res.user.role);
                const newMenuData = getMenuDataForRole(res.user.role);
                setMenuData(newMenuData);

                // Redirect manager users to ChecklistManagement page
                if (res.user.role === "manager") {
                    setTimeout(() => navigate('/checklist'), 100);
                }

                return res;
            }
            return res;
        })
    };

    const handleLogout = useCallback(() => {
        client.logout().then(() => {
            setLoggedIn(false);
            setUserRole(null);
            setMenuData([]);
            navigate('/login');
        });
    }, [client, setLoggedIn, setUserRole, navigate]);

    let initDashboard = null;
    try {
        initDashboard = JSON.parse(window.localStorage.getItem('dashboard'));
    } catch (e) {
        console.error(e);
        window.localStorage.removeItem('dashboard');
    }

    useEffect(() => {
        if (client?.session?.role && !userRole) {
            setUserRole(client.session.role);
        }
    }, [client, userRole]);

    useEffect(() => {
        if (userRole && !menuData.length) {
            const newMenuData = getMenuDataForRole(userRole);
            setMenuData(newMenuData);
        }
    }, [userRole, menuData.length]);

    useEffect(() => {
        // Auto-hide sidebar on mobile devices
        if (isMobile) {
            setShowSidebar(false);
        }
    }, [isMobile]);

    // Handle back button on mobile
    useEffect(() => {
        const handleBackButton = (e) => {
            if (isMobile && showSidebar) {
                e.preventDefault();
                setShowSidebar(false);
                return;
            }
        };

        window.addEventListener('popstate', handleBackButton);
        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [isMobile, showSidebar]);

    const renderLoggedIn = () => {
        return (
            <>
                <Topbar
                    themeMode={themeMode}
                    toggleThemeMode={toggleThemeMode}
                    toggleSidebar={toggleSidebar}
                    handleLogout={handleLogout}
                    isMobile={isMobile}
                />
                <Box
                    flex
                    direction={isBreakSidebar() ? 'column-reverse' : 'row'}
                    height={isMobile ? '100%' : 'auto'}
                >
                    <Sidebar
                        showSidebar={showSidebar}
                        background="#01060d"
                        themeMode={themeMode}
                        toggleThemeMode={toggleThemeMode}
                        setShowSidebar={setShowSidebar}
                        isMobile={isMobile}
                    />
                    <Box
                        flex
                        overflow="auto"
                        className="scroll-enabled"
                        height={isMobile ? '100%' : 'auto'}
                        width={isMobile && showSidebar ? '0' : '100%'}
                    >
                        <Routes>
                            {userRole === "admin" && <Route path="/*" element={<AdminRoutes />} />}
                            {userRole === "manager" && <Route path="/*" element={<ManagerRoutes />} />}
                            {userRole === "user" && <Route path="/*" element={<UserRoutes />} />}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Box>
                </Box>
            </>
        );
    };

    const renderContent = () => {
        return !loggedIn ? (
            <Routes>
                <Route path="/login" element={<Login onLogin={onLogin} />} />
                <Route path="/feedback/:siteId" element={<FeedbackForm />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        ) : userRole ? (  // Ensure userRole exists before routing
            renderLoggedIn()
        ) : (
            <Navigate to="/login" replace />
        );
    };
    return (
        <DashboardProvider dashboard={initDashboard}>
            <MenuProvider menuData={menuData}>
                {loggedIn === null && restoredSession ? (
                    <LoadingLayer />
                ) : (
                    <Box
                        data-id="id-indiTechCrm"
                        fill
                        overflow={isMobile ? "hidden" : "auto"}
                        style={isMobile ? {
                            height: '100vh',
                            width: '100vw',
                            position: 'fixed',
                            top: 0,
                            left: 0
                        } : {}}
                    >
                        {renderContent()}
                    </Box>
                )}
            </MenuProvider>
        </DashboardProvider>
    );
};

MenuApp.propTypes = {
    themeMode: PropTypes.string.isRequired,
    toggleThemeMode: PropTypes.func.isRequired,
};

export default MenuApp;
