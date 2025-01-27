import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Form,
    Grid,
    Header,
    Layer,
    FormField,
    Spinner,
    Text,
    TextInput,
} from 'grommet';
import {
    FormNext,
    StatusGood,
    StatusWarning,
    StatusCritical,
    StatusUnknown,
} from 'grommet-icons';

import {
    ProductText,
} from '../../components';

const FormContainer = ({ ...rest }) => (
    <Box background="background-front" border round="small" overflow="hidden">
        <Box flex pad="medium" {...rest} />
    </Box>
);

const StatusBanner = ({ severity, reverse = false, children }) => {
    let background = !reverse && 'status-critical';
    let icon = <StatusCritical color={reverse && 'status-critical'} />;
    if (severity === 'ok') {
        background = !reverse && 'status-ok';
        icon = <StatusGood color={reverse && 'status-ok'} />;
    } else if (severity === 'warning') {
        background = !reverse && 'status-warning';
        icon = <StatusWarning color={reverse && 'status-warning'} />;
    } else if (severity === 'unknown') {
        background = !reverse && 'status-unknown';
        icon = <StatusUnknown color={reverse && 'status-unknown'} />;
    }

    return (
        <Box direction="row" background={background} fill="horizontal" pad="xsmall">
            {icon}
            <Text margin={{ left: 'small' }}>{children}</Text>
        </Box>
    );
};

const Login = ({ onLogin, didFwu = false }) => {
    const navigate = useNavigate();
    const userNameRef = React.createRef();

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState();

    // Indicates we sent login request and are waiting for response
    const [waiting, setWaiting] = useState(false);

    const renderError = () => (
        <StatusBanner severity="critical">{error}</StatusBanner>
    );

    return (
        <Grid fill rows={['auto', 'xsmall']}>
            <Box pad="none" justify="center" align="center">
                <Box
                    justify="center"
                    background={{
                        color: 'black',
                    }}>
                    <Box flex={false}>
                        <Box
                            fill
                            justify="center"
                            align="center"
                            animation="fadeIn"
                            size={{ height: { min: 'large' } }}
                        >
                            <ProductText
                                // productName="Sample"
                                vendor="Afoozo"
                                size="xxlarge"
                                margin={{ bottom: 'medium' }}
                            />
                            <FormContainer width="medium">
                                <Box gap="medium">
                                    <Header
                                        direction="column"
                                        align="start"
                                        gap="xxsmall"
                                        pad={{ horizontal: 'xxsmall' }}
                                    >
                                        <Text size="xxlarge" weight="bold">
                                            Sign In
                                        </Text>
                                    </Header>
                                    <Box
                                        // Padding used to prevent focus from being cutoff
                                        pad={{ horizontal: 'xxsmall' }}
                                    >
                                        <Form
                                            onSubmit={(event) => {
                                                setWaiting(true);
                                                setError(undefined);
                                                event.preventDefault();
                                                console.log({ userName, password });
                                                onLogin(userName, password).then((res) => {
                                                    if (res.status === 200) {
                                                        navigate('/');
                                                    } else {
                                                        setWaiting(false);
                                                        if (res.status === 401) {
                                                            res
                                                                .json()
                                                                .then((json) => {
                                                                    setError(
                                                                        json.error['@Message.ExtendedInfo'][0]
                                                                            .Message,
                                                                    );
                                                                })
                                                                .catch(() => {
                                                                    setError('Bad credentials');
                                                                });
                                                        } else {
                                                            setError(
                                                                /* eslint-disable max-len */
                                                                res.status === 503
                                                                    ? 'Bad credentials'
                                                                    : 'Bad credentials',
                                                                /* eslint-enable max-len */
                                                            );
                                                        }
                                                    }
                                                });
                                                // onLogin(userName, password);
                                                // navigate("/");
                                            }}
                                        >
                                            <FormField
                                                htmlFor="id-login-user"
                                                name="user"
                                                label="Enter your email address"
                                                required={{ indicator: false }}
                                            >
                                                <TextInput
                                                    id="id-login-user"
                                                    name="user"
                                                    type="text"
                                                    htmlFor="user-sign-in"
                                                    ref={userNameRef}
                                                    size="small"
                                                    placeholder="User"
                                                    value={userName}
                                                    onChange={(event) =>
                                                        setUserName(event.target.value)
                                                    }
                                                />
                                            </FormField>
                                            <FormField
                                                htmlFor="id-login-password"
                                                name="password"
                                                label="Password"
                                                required={{ indicator: false }}
                                            >
                                                <TextInput
                                                    id="id-login-password"
                                                    name="password"
                                                    size="small"
                                                    type="password"
                                                    htmlFor="password-sign-in"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(event) =>
                                                        setPassword(event.target.value)
                                                    }
                                                />
                                            </FormField>
                                            {error && renderError()}
                                            <Box
                                                align="start"
                                                margin={{ top: 'medium', bottom: 'small' }}
                                            >
                                                <Button
                                                    type="submit"
                                                    label={waiting ? 'Signing in...' : 'Sign in'}
                                                    icon={<FormNext />}
                                                    reverse
                                                    disabled={waiting}
                                                    primary
                                                    onClick={() => { }}
                                                />
                                            </Box>
                                        </Form>
                                    </Box>
                                </Box>
                            </FormContainer>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box justify="center" background={{ color: 'black' }}>
                {/* <Footer /> */}
            </Box>
        </Grid>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
    didFwu: PropTypes.bool,
};

export default Login;
