import React from 'react';
import PropTypes from 'prop-types';
import { Box, Footer, Text } from 'grommet';

const Information = ({ content = null }) => (
    <Footer
        border={{ side: 'top' }}
        direction="row"
        pad={{ vertical: 'small', horizontal: 'medium' }}
        width="100%"
        justify="center"
    >
        {content && <Box>{content}</Box>}
    </Footer>
);

const CoverPage = ({ title, children }) => (
    <Box
        fill
        height={{ min: '100vh' }}
        background="background"
    >
        <Box
            flex="grow"
            overflow={{ vertical: 'auto' }}
        >
            {children}
        </Box>

        <Box flex={false}>
            <Information
                content={
                    <Box align="center" gap="xsmall">
                        <Text size="small">
                            © {new Date().getFullYear()} Afoozo
                        </Text>
                        <Text size="xsmall" >
                            All rights reserved.
                        </Text>
                    </Box>
                }
            />
        </Box>
    </Box>
);

CoverPage.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default CoverPage;
