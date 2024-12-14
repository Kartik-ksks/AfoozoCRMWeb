import React from 'react';
import PropTypes from 'prop-types';
import { Box, Footer, Heading, Markdown, Text } from 'grommet';

const Information = ({ content = null }) => (
    <Footer
        border={{ side: 'top', color: 'light-4' }}
        direction="row"
        pad={{ vertical: 'small', horizontal: 'medium' }}
        style={{
            position: 'absolute', // Positions it at the bottom
            bottom: 0
        }}
    >
        {content && <Box margin={{ left: 'small' }}>{content}</Box>}
    </Footer>
);

const PageTitle = ({ title }) => {
    return (
        <Box flex={false} direction="row" justify="between" align="center">
            <Heading level="1" margin="small">
                {title}
            </Heading>
        </Box>
    );
};

const CoverPage = ({ title, children }) => (
    <Box align="center" pad="medium" gap="medium">
        <PageTitle title={title} />
        {children}
        <Information
            content={
                <Box align="center" gap="xsmall">
                    <Text size="small" weight="bold">
                        &copy; {new Date().getFullYear()} Campus Canteen
                    </Text>
                    <Text size="xsmall" color="dark-6">
                        All rights reserved.
                    </Text>
                </Box>
            }
        />
    </Box>
);


CoverPage.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default CoverPage;
