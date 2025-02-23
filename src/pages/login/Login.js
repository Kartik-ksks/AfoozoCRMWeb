import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Form,
    Header,
    FormField,
    Text,
    TextInput,
} from 'grommet';
import { FormNext, StatusCritical, StatusWarning } from 'grommet-icons';
import { ProductText, CoverPage } from '../../components';

const FormContainer = ({ themeMode, ...rest }) => (
    <Box
        background={themeMode === 'dark' ? 'black' : 'white'}
        border={{
            color: themeMode === 'dark' ? 'transparent' : 'border',
            size: 'small'
        }}
        round="small"
        overflow="hidden"
        elevation={themeMode === 'dark' ? 'none' : 'small'}
    >
        <Box flex pad="medium" {...rest} />
    </Box>
);

const StatusBanner = ({ children, type = 'error' }) => (
    <Box
        direction="row"
        background={type === 'error' ? 'status-critical' : 'status-warning'}
        round="xsmall"
        pad="small"
        gap="small"
        margin={{ top: 'small' }}
    >
        {type === 'error' ? (
            <StatusCritical color="white" />
        ) : (
            <StatusWarning color="white" />
        )}
        <Text color="white">{children}</Text>
    </Box>
);

const Login = ({ onLogin, themeMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [waiting, setWaiting] = useState(false);

    // Check if session expired from location state
    const sessionExpired = location.state?.sessionExpired;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setWaiting(true);
        setError('');

        try {
            await onLogin(userName, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed');
            setWaiting(false);
        }
    };

    return (
        <Box
            fill
            align="center"
            justify="center"
            background={themeMode === 'dark' ? 'black' : 'light-1'}
        >
            <CoverPage title="Login">
                <Box
                    width="medium"
                    pad="medium"
                    gap="medium"
                    fill
                    align="center"
                    justify="center"
                >
                    <Box align="center" margin={{ bottom: 'medium' }}>
                        <ProductText
                            vendor="Afoozo"
                            size="xxlarge"
                            color={themeMode === 'dark' ? 'white' : 'dark-1'}
                        />
                    </Box>

                    <FormContainer themeMode={themeMode}>
                        <Box gap="large">
                            <Header
                                direction="column"
                                align="start"
                                gap="xxsmall"
                                pad={{ horizontal: 'xxsmall' }}
                            >
                                <Text
                                    size="xxlarge"
                                    weight="bold"
                                    color={themeMode === 'dark' ? 'white' : 'dark-1'}
                                >
                                    Sign In
                                </Text>
                            </Header>

                            <Form
                                onSubmit={handleSubmit}
                            >
                                <FormField
                                    htmlFor="username"
                                    name="username"
                                    label="Username"
                                    required={{ indicator: false }}
                                >
                                    <TextInput
                                        id="username"
                                        name="username"
                                        value={userName}
                                        onChange={(event) => setUserName(event.target.value)}
                                    />
                                </FormField>

                                <FormField
                                    htmlFor="password"
                                    name="password"
                                    label="Password"
                                    required={{ indicator: false }}
                                >
                                    <TextInput
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                    />
                                </FormField>

                                {sessionExpired && (
                                    <StatusBanner type="warning">
                                        Your session has expired. Please login again.
                                    </StatusBanner>
                                )}

                                {error && <StatusBanner>{error}</StatusBanner>}

                                <Box direction="row" justify="end" margin={{ top: 'medium' }}>
                                    <Button
                                        type="submit"
                                        label={waiting ? 'Signing in...' : 'Sign in'}
                                        icon={<FormNext />}
                                        disabled={waiting}
                                        primary
                                        color="brand"
                                    />
                                </Box>
                            </Form>
                        </Box>
                    </FormContainer>
                </Box>
            </CoverPage>
        </Box>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
    themeMode: PropTypes.oneOf(['dark', 'light']).isRequired,
};

export default Login;
