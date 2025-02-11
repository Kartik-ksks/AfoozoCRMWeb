import React, {
    createContext,
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from 'react';
import PropTypes from 'prop-types';

import AfoozoClient from './Client';

export const Context = createContext({});
Context.displayName = 'SessionContext';

// Create a single client instance
const client = new AfoozoClient();

export const Provider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(() => {
        // Try to restore session on initial load
        const restored = client.restoreSession();
        return restored ? true : null;
    });

    const [sessionExpired, setSessionExpired] = useState(false);
    const [restoredSession, setRestoredSession] = useState(() => {
        return !!client.session;
    });

    const [userRole, setUserRole] = useState(() => {
        return client.session?.role || null;
    });

    // Handle session restoration on mount
    useEffect(() => {
        if (restoredSession && loggedIn === null) {
            client.testRestoredSession()
                .then((works) => {
                    setLoggedIn(works);
                    setRestoredSession(false);
                    if (works) {
                        setUserRole(client.session.role);
                    }
                })
                .catch(() => {
                    setLoggedIn(false);
                    setRestoredSession(false);
                    setUserRole(null);
                });
        }
    }, [restoredSession]);

    // Handle session expiration
    useEffect(() => {
        client.onSessionExpired = () => {
            setSessionExpired(true);
            setLoggedIn(false);
            setUserRole(null);
        };
    }, []);

    const INIT_USERROLE = 'Unknown';
    const userRoleAssigned = useCallback(
        () => userRole !== INIT_USERROLE,
        [userRole],
    );
    const clearUserRole = () => setUserRole(INIT_USERROLE);

    const providedContext = useMemo(
        () => ({
            client,
            userRole,
            setUserRole,
            userRoleAssigned,
            clearUserRole,
            loggedIn,
            setLoggedIn,
            sessionExpired,
            setSessionExpired,
            restoredSession,
            setRestoredSession,
        }),
        [
            loggedIn,
            restoredSession,
            sessionExpired,
            userRole,
            userRoleAssigned,
        ],
    );

    return (
        <Context.Provider value={providedContext}>
            {children}
        </Context.Provider>
    );
};

export const { Consumer } = Context;

Provider.propTypes = {
    children: PropTypes.node.isRequired,
};
