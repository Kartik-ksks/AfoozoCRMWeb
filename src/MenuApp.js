import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Button, Text, Box } from 'grommet';

import { DashboardProvider } from './context/dashboard';
import { CartContext, CartProvider } from './context/cart';

import { QLayer, Tile, Topbar } from './components';
import { Home, Menus } from './pages';

const Layer = ({ toggleCartLayer }) => {
    const { cart } = useContext(CartContext);
    const calculateTotal = () => {
        return cart
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2);
    };
    return (
        <QLayer
            title='Cart'
            displayInfo={false}
            onClose={toggleCartLayer}
        >
            <Box pad="small">
                {console.log(cart) || cart.length > 0 ?
                    <Tile>
                        {cart.map((item) => (
                            <>
                                <Text key={item.id}>
                                    {item.name}
                                </Text>
                                <Text>
                                    - ₹{item.price} x {item.quantity}
                                </Text>
                            </>
                        ))}

                        <Tile margin={{ bottom: 'small', top: 'medium' }}>
                            <Text >Total:</Text>
                            <Text>₹{calculateTotal()}</Text>
                        </Tile>
                    </Tile> :
                    <Text>
                        Add items to Cart.
                    </Text>
                }
            </Box>
            <Box
                direction="row-responsive"
                justify="end"
                gap="medium"
                margin={{ bottom: 'small', top: 'medium' }}
            >
                <Button label='Go Back' onClick={toggleCartLayer} />
                <Button label='Place Order' primary onClick={console.log('log')} />
            </Box>
        </QLayer>
    )
};

const MenuApp = ({ themeMode, toggleThemeMode }) => {
    const [showCart, setShowCart] = useState(false);

    const toggleCartLayer = () => {
        setShowCart((prevShowCart) => {
            return !prevShowCart;
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
                    toggleCartLayer={toggleCartLayer}
                />
                <Box flex>
                    <Box flex overflow="auto">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/:menus/:menu" element={<Menus />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Box>
                </Box>
            </>
        );
    };

    const renderContent = () => {
        return renderLoggedIn();
    };

    return (
        <DashboardProvider dashboard={initDashboard}>
            <CartProvider>
                <Box data-id="id-menuapp" fill overflow="auto">
                    {renderContent()}
                    {showCart &&
                        <Layer
                            toggleCartLayer={toggleCartLayer}
                        />}
                </Box>
            </CartProvider>
        </DashboardProvider>
    );
};

MenuApp.propTypes = {
    themeMode: PropTypes.string.isRequired,
    toggleThemeMode: PropTypes.func.isRequired,
};

export default MenuApp;
