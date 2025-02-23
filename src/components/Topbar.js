import React, { useContext, useState } from 'react';
import { Box, Button, DropButton, Header, Text } from 'grommet';
import { Menu, Logout, Shop, Moon, Sun, User } from 'grommet-icons';
import ProductText from './ProductText';
import RoutedButton from './RoutedButton';
import styled from 'styled-components';
import { SessionContext } from '../context/session';

const StyledMenu = styled(Menu)`
  transition: all 0.3s ease-in-out;
  transform: ${(props) => `rotate(${props.begin})`};
  transform: ${(props) => (props.toggle ? `rotate(${props.end})` : '')};
`;

const RotatingMenu = ({
    begin,
    end,
    onClick,
    startClicked,
    ...rest
}) => {
    const [toggle, setToggle] = useState(false);

    const handleClick = () => {
        setToggle((p) => !p);
        setTimeout(onClick); // callback
    };

    return (
        <StyledMenu
            toggle={toggle ? 1 : 0}
            begin={startClicked ? end : begin}
            end={startClicked ? begin : end}
            onClick={handleClick}
            {...rest}
        />
    );
};

const Topbar = ({ toggleSidebar, toggleThemeMode, themeMode, handleLogout }) => {
    const { client } = useContext(SessionContext);
    const onLogout = () => {
        handleLogout();
    };
    return (
        <>
            <Box
                flex={false}
                tag="header"
                direction="row"
                justify="between"
                align="center"
                gap="small"
                style={{ zIndex: '2' }}
            >
                {/* Left section */}
                <Box flex={false} direction="row" align="center">
                    <Box
                        margin={{ left: 'small', top: 'xsmall' }}
                        flex={false}
                        justify="center"
                    >
                        <Button
                            icon={
                                <Box pad="xsmall">
                                    <RotatingMenu
                                        data-id="id-topbar-sidebar-control"
                                        a11yTitle="Toggle the sidebar"
                                        begin="0deg"
                                        end="90deg"
                                        onClick={toggleSidebar}
                                    />
                                </Box>
                            }
                            onClick={toggleSidebar}
                        />
                    </Box>
                    <Header fill="horizontal">
                        <RoutedButton
                            data-id="id-header-home-button"
                            a11yTitle="Home"
                            path="/"
                        >
                            <Box
                                direction="row"
                                gap="small"
                                align="center"
                                margin={{ left: 'small', right: 'small' }}
                            >
                                <Text>
                                    Afoozo
                                </Text>
                                <Box overflow="visible" flex={false}>
                                    <ProductText weight="bold" />
                                </Box>
                            </Box>
                        </RoutedButton>
                    </Header>
                </Box>
                <Box flex={false} direction="row" align="center">
                    <Button
                        data-id="id-theme-mode"
                        onClick={toggleThemeMode}
                        icon={themeMode === 'light' ? <Moon /> : <Sun />}
                    />
                    <DropButton
                        data-id="id-topbar-menu-user"
                        a11yTitle="User menu"
                        dropAlign={{ right: 'right', top: 'bottom' }}
                        icon={
                            <Box pad="xsmall">
                                <User />
                            </Box>
                        }
                        dropContent={
                            <Box align="start">
                                <Box border="bottom" pad={{ left: 'small', right: 'small' }}>
                                    <Text size="large">{client?.session?.username}</Text>
                                    <Box direction="row" gap="xsmall">
                                        <Text weight="bold">Role:</Text>
                                        <Text>{client?.session?.role}</Text>
                                    </Box>
                                    <Box direction="row" gap="xsmall">
                                        <Text weight="bold">Email:</Text>
                                        <Text>{client?.session?.email}</Text>
                                    </Box>
                                </Box>
                                <Button
                                    data-id="id-topbar-button-user-logout"
                                    label="Logout"
                                    onClick={onLogout}
                                    icon={<Logout />}
                                    gap="xsmall"
                                />
                            </Box>
                        }
                    />
                </Box>
            </Box>
        </>
    );
};

export default Topbar;
