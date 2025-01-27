import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Button, Text, Box } from 'grommet';

import { DashboardProvider } from './context/dashboard';
import { ResponsiveContext } from './context/responsive';
// import { CartContext, CartProvider } from './context/cart';

import { QLayer, Tile, Topbar } from './components';
import { Home, Menus, Login, Accounts, Masters } from './pages';
import { SessionContext } from './context/session';

import { Sidebar } from './sidebar';
import { MenuProvider } from './context/menu';

import { LoadingLayer } from './components/LoadingLayer';


const MenuApp = ({ themeMode, toggleThemeMode }) => {
    const {
        client,
        loggedIn,
        setLoggedIn,
        setSessionExpired,
        sessionExpired,
        restoredSession,
        setRestoredSession,
    } = useContext(SessionContext);
    const { isBreakSidebar } = useContext(ResponsiveContext);
    const [showSidebar, setShowSidebar] = useState(true);

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
            setLoggedIn(res.status === 200);
            setSessionExpired(false);
            return res;
        });
    };

    let initDashboard = null;
    try {
        initDashboard = JSON.parse(window.localStorage.getItem('dashboard'));
    } catch (e) {
        console.error(e);
        window.localStorage.removeItem('dashboard');
    }

    const renderLoggedIn = () => {
        return (
            <>
                <Topbar
                    themeMode={themeMode}
                    toggleThemeMode={toggleThemeMode}
                    // toggleCartLayer={toggleCartLayer}
                    toggleSidebar={toggleSidebar}
                />
                <Box flex direction={isBreakSidebar() ? 'column-reverse' : 'row'}>
                    <Sidebar
                        // settings={settings}
                        // updateSettings={updateSettings}
                        showSidebar={showSidebar}
                        background="red!"
                        themeMode={themeMode}
                        toggleThemeMode={toggleThemeMode}
                    />
                    <Box flex overflow="auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/masters/:master" element={<Masters />} />
                            <Route path="/masters" element={<Masters />} />
                            {/* <Route path="/accounts" element={<Accounts />} /> */}
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
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                    path="/login"
                    element={<Login onLogin={onLogin} />}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        ) : (
            renderLoggedIn()
        );
    };

    return (
        <DashboardProvider dashboard={initDashboard}>
            <MenuProvider>
                {/* <CartProvider> */}
                    {loggedIn === null && restoredSession ? (
                        <LoadingLayer />
                    ) : (
                        <Box data-id="id-indiTechCrm" fill overflow="auto">
                            {renderContent()}
                        </Box>
                    )}
                {/* </CartProvider> */}
            </MenuProvider>
        </DashboardProvider>
    );
};

MenuApp.propTypes = {
    themeMode: PropTypes.string.isRequired,
    toggleThemeMode: PropTypes.func.isRequired,
};

export default MenuApp;
