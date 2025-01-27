import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tab, Tabs } from 'grommet';
import { useLocation, useNavigate } from 'react-router-dom';

const RoutedTabs = ({ items, selected, path }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveTabIndex = () => {
        const activeTabIndex = items.findIndex((item) => item.key === selected);
        return activeTabIndex !== -1 ? activeTabIndex : 0;
    };

    const setActiveTabIndex = (index) => {
        const { key } = items[index];
        const subpath = key ? `/${key}` : '';
        const currPath = location.pathname;
        const regex = new RegExp(`^${path}/.+?/`);

        if (currPath && currPath.match(regex)) {
            navigate(currPath.replace(regex, `${path}${subpath}/`));
        } else {
            navigate(`${path}${subpath}`);
        }
    };

    return (
        <Tabs
            margin={{ top: 'small' }}
            activeIndex={getActiveTabIndex()}
            onActive={setActiveTabIndex}
        >
            {items.map(({ key, title, children }) =>
                items.length < 2 ? (
                    children
                ) : (
                    <Tab
                        key={key}
                        title={
                            <Box direction="row" align="center" gap="xsmall">
                                {title}
                            </Box>
                        }
                        margin={{ right: 'small' }}
                    >
                        {children}
                    </Tab>
                ),
            )}
        </Tabs>
    );
};

RoutedTabs.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.node,
            children: PropTypes.node,
        }),
    ).isRequired,
    // This must be a key in one of the items
    selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // This is the base path that the selected key is appended to
    path: PropTypes.string.isRequired,
};

RoutedTabs.defaultProps = {
    selected: null,
};

export default RoutedTabs;
