import React, {
    createContext,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';

import AfoozoClient from './Client';

export const Context = createContext({});
Context.displayName = 'SessionContext';

// An immutable client, make it global
const client = new AfoozoClient();
const restored = client.restoreSession();

export const Provider = ({ children = null }) => {
    const INIT_USERROLE = 'Unknown';
    const [userRole, setUserRole] = useState(INIT_USERROLE);
    const userRoleAssigned = useCallback(
        () => userRole !== INIT_USERROLE,
        [userRole],
    );
    const clearUserRole = () => setUserRole(INIT_USERROLE);

    const [loggedIn, setLoggedIn] = useState(null);
    const [restoredSession, setRestoredSession] = useState(restored);
    const [sessionExpired, setSessionExpired] = useState(false);

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
        <Context.Provider value={providedContext}>{children}</Context.Provider>
    );
};

export const { Consumer } = Context;

Provider.propTypes = {
    children: PropTypes.node,
};
