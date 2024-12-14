import React, { useContext, useState } from 'react';
import { Box, Button, DropButton, Header, Menu, Text } from 'grommet';
import { Logout, Shop, Moon, Sun, User } from 'grommet-icons';
import ProductText from './ProductText';
import RoutedButton from './RoutedButton';
import IconIndicator from './IconIndicator';
import { CartContext } from '../context/cart';

const Topbar = ({ toggleThemeMode, themeMode, toggleCartLayer }) => {
    const { cart } = useContext(CartContext)
    const onLogout = () => {
        console.log('logout');
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
                <Box flex={false} direction="row" align="center">
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
                                    Campus Canteen
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
                    <Button
                        data-id="id-theme-mode"
                        onClick={toggleCartLayer}
                        icon={
                            <IconIndicator
                                icon={Shop}
                                indicator={cart.length > 0}
                                indicatorColor='status-ok'
                            />}
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
                                    <Text size="large">Kartik</Text>
                                    <Box direction="row" gap="xsmall">
                                        <Text weight="bold">Role:</Text>
                                        <Text>7718945135</Text>
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
