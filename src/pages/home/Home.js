import React, { useContext } from 'react';
import { Box, Grid, InfiniteScroll, Text } from 'grommet';

import { CoverPage, RoutedButton, Tile } from '../../components';
import { CartContext } from '../../context/cart';

// eslint-disable-next-line react/prop-types
const Home = () => {
    // const { dishes } = useContext(CartContext);
    // let homeCards = dishes['categorys'];
    let homeCards = [];
    return (
        <Box
            flex
            pad="medium"
            margin={{ left: 'medium', top: 'small', right: 'small' }}
            align="left"
        >
            <Grid columns="small" gap="small">
                <InfiniteScroll items={homeCards}>
                    {(card) => (
                        <Tile key={card.name}>
                            <RoutedButton path={`/${card.path}/overview`} fill>
                                <Box direction="row" gap="small">
                                    {card.Icon && <card.Icon />}
                                    <Text>
                                        <strong>{card.name}</strong>
                                    </Text>
                                </Box>
                                {card.description && (
                                    <Box direction="row" justify="center" gap="xsmall">
                                        {card.description && (
                                            <Text size="small">{card.description}</Text>
                                        )}
                                    </Box>
                                )}
                            </RoutedButton>
                        </Tile>
                    )}
                </InfiniteScroll>
            </Grid>
        </Box>
    );
};

export default Home;
