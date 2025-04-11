import React, {
    createContext,
    useCallback,
    useMemo,
    useState,
    useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AfoozoClient from './Client';
import { useEncryptedStorage } from './hooks';

export const Context = createContext({});
Context.displayName = 'SessionContext';

// Create a single client instance
const client = new AfoozoClient();

export const Provider = ({ children, onSessionExpired }) => {
    const navigate = useNavigate();
    const { getItem, setItem, removeItem } = useEncryptedStorage();
    client.navigate = navigate;
    client.getItem = getItem;
    client.setItem = setItem;
    client.removeItem = removeItem;
    const [loggedIn, setLoggedIn] = useState(() => {
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

    const handleLogout = useCallback(() => {
        client.logout().then(() => {
            setLoggedIn(false);
            setUserRole(null);
        });
    }, []);

    // Handle session restoration on mount
    useEffect(() => {
        if (restoredSession && loggedIn === null) {
            client.testRestoredSession()
                .then((works) => {
                    setRestoredSession(false);
                    if (works) {
                        setLoggedIn(works);
                        setUserRole(client.session.role);
                    } else {
                        handleLogout();
                    }
                })
                .catch(() => {
                    setLoggedIn(false);
                    setRestoredSession(false);
                    setUserRole(null);
                    handleLogout();
                });
        }
    }, [restoredSession, handleLogout, loggedIn]);

    // Handle session expiration
    useEffect(() => {
        client.onSessionExpired = () => {
            setSessionExpired(true);
            setLoggedIn(false);
            setUserRole(null);
            if (onSessionExpired) {
                onSessionExpired();
            }
        };
    }, [onSessionExpired]);

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

Provider.propTypes = {
    children: PropTypes.node.isRequired,
    onSessionExpired: PropTypes.func,
};

export const { Consumer } = Context;
