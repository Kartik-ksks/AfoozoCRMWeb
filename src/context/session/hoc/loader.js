import React, { useContext, useEffect, useState } from 'react';

import { SessionContext } from '../context';
import { LoadingLayer } from '../components';

export const withLoader = (WrappedComponent) => (props) => {
    const { client } = useContext(SessionContext);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
            client.waitForFetches().then(() => {
            setLoading(false);
        });
    }, [client]);

    return loading ? (
        <>
            <WrappedComponent {...props} />
            <LoadingLayer />
        </>
    ) : (
        <WrappedComponent {...props} />
    );
};
