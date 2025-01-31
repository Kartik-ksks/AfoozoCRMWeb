import React from 'react';
import PropTypes from 'prop-types';
import { Box, Footer, Heading, Text } from 'grommet';

const Information = ({ content = null }) => (
    <Footer
        border={{ side: 'top', color: 'light-4' }}
        direction="row"
        pad={{ vertical: 'small', horizontal: 'medium' }}
        background="background"
        width="100%"
        justify="center"
    >
        {content && <Box>{content}</Box>}
    </Footer>
);

const PageTitle = ({ title }) => {
    return (
        <Box
            width="100%"
            direction="row"
            align="center"
            justify="center"
        >
            <Heading
                level="1"
                margin="small"
                textAlign="center"
            >
                {title}
            </Heading>
        </Box>
    );
};

const CoverPage = ({ title, children }) => (
    <Box
        fill
        justify="between"
        overflow="auto"
    >
        {/* <Box gap="medium">
            <PageTitle title={title} />
            <Box
                flex="grow"
                pad="medium"
                align="center"
                justify="center"
            >
                {children}
            </Box>
        </Box> */}
        {children}
        <Box flex={false} margin={{ top: 'auto' }}>
            <Information
                content={
                    <Box align="center" gap="xsmall">
                        <Text size="small" weight="bold">
                            &copy; {new Date().getFullYear()} Afoozo
                        </Text>
                        <Text size="xsmall" color="dark-6">
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
