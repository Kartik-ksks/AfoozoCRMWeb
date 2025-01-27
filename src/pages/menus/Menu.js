import React, { useState, useContext } from 'react';
import { Box, Button, Text } from 'grommet';
import { useParams } from 'react-router-dom';

import { CoverPage, RoutedTabs, Tile } from '../../components';
import { CartContext } from '../../context/cart';
import { FormSubtract, FormAdd } from 'grommet-icons';


const Menus = () => {
    const { menus, menu } = useParams();
    const {
        cart,
        addToCart,
        updateCartQuantity,
        dishes
    } = useContext(CartContext);

    const MenuTile = ({ header, menu = [] }) => (
        <Tile title={header}>
            {menu.length > 0 ? (
                menu.map((item, index) => (
                    <Box
                        key={index}
                        flex={false}
                        tag="header"
                        direction="row"
                        justify="between"
                        align="center"
                        gap="small"
                        style={{ zIndex: '2' }}
                        pad={{ vertical: 'xsmall', horizontal: 'small' }}
                        border={{ side: 'bottom', color: 'light-4' }}
                    >
                        <Box flex={false} direction="row" align="center">
                            <Text size="xsmall">{item.name}</Text>
                        </Box>
                        <Box flex={false} direction="row" align="center">
                            <AddToCartButton item={item} addToCart={addToCart} updateCartQuantity={updateCartQuantity} />
                        </Box>
                    </Box>
                ))
            ) : (
                <Box
                    align="center"
                    pad="medium"
                    border={{ side: 'top', color: 'light-4' }}
                >
                    <Text color="status-critical">No items available</Text>
                </Box>
            )}
        </Tile>
    );

    const AddToCartButton = ({ item, updateCartQuantity, addToCart }) => {
        const [count, setCount] = useState(0);

        const getItemQuantity = (item) => {
            const cartItem = cart.find((cartItem) => cartItem.id === item.id);
            return cartItem ? cartItem.quantity : 0;
        };

        const quantity = getItemQuantity(item);
        console.log(item);
        const handleIncrement = () => {
            let newCount = quantity + 1;
            updateCartQuantity(item, newCount); // Update cart quantity
        };

        const handleDecrement = () => {
            let newCount = Math.max(quantity - 1, 0);
            updateCartQuantity(item, newCount); // Update cart quantity
        };

        return (
            <Box direction="row" gap="small" align="center">
                {quantity > 0 ? (
                    <>
                        <Button
                            icon={<FormSubtract />}
                            onClick={handleDecrement}
                        />
                        <Text>{quantity}</Text>
                        <Button
                            icon={<FormAdd />}
                            onClick={handleIncrement}
                        />
                    </>
                ) : (
                    <Button
                        margin={{ left: "small" }}
                        size="small"
                        primary
                        onClick={() => {
                            setCount(1); // Start count at 1
                            addToCart(item); // Add the item to the cart
                            updateCartQuantity(item, 1); // Update cart quantity
                        }}
                        label={<Text size="xsmall">{`Add to Cart`}</Text>}
                    />
                )}
            </Box>
        );
    };

    const renderTabTitle = (text) => (
        <Box direction="row" gap="xsmall">
            <Text>{text}</Text>
        </Box>
    );

    const renderFallbackTab = () => [
        {
            key: 'no-menu',
            title: renderTabTitle('No Menu Available'),
            children: (
                <Box align="center" pad="medium">
                    <Text color="status-critical">No dishes available</Text>
                </Box>
            ),
        },
    ];

    return (
        <Box fill>
            <RoutedTabs
                path={menus || ''}
                selected={menu || ''}
                items={
                    Array.isArray(dishes.categorys) && dishes.categorys.length > 0
                        ? dishes.categorys.flatMap((category) =>
                            Array.isArray(category.menuItems) && category.menuItems.length > 0 && category.path === menus
                                ? category.menuItems.map((dish) => ({
                                    key: dish.path || dish.name || Math.random().toString(36).substring(2, 8),
                                    title: renderTabTitle(dish.name || 'Unnamed Dish'),
                                    children: (
                                        <MenuTile
                                            header={dish.name || 'Unnamed Dish'}
                                            menu={dish.subItems || []} // Use subItems from menuItems
                                        />
                                    ),
                                }))
                                : [] // Skip categories with no menuItems
                        )
                        : renderFallbackTab()
                }
            />
        </Box>
    );
};

export default Menus;
