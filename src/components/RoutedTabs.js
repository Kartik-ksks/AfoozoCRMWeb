import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tab, Tabs } from 'grommet';
import { useLocation, useNavigate } from 'react-router-dom';

const RoutedTabs = ({ items, selected = null, path }) => {
    // console.log({ path, selected });
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveTabIndex = () => {
        const activeTabIndex = items.findIndex((item) => item.key === selected);
        return activeTabIndex !== -1 ? activeTabIndex : 0;
    };

    // Handle tab navigation based on selected tab item
    const setActiveTabIndex = (index) => {
        // Ensure index is valid
        if (index < 0 || index >= items.length) {
            console.error("Invalid index provided for tab navigation.");
            return;
        }

        // Destructure the key from the selected tab item
        const { key } = items[index] || {};
        const subpath = key ? `/${key}` : '';
        const currPath = location.pathname;

        // Create regex to match and replace the subpath
        const regex = new RegExp(`^/${path}/[^/]+`);

        // console.log({
        //     key,
        //     index,
        //     subpath,
        //     currPath,
        //     regex: regex.toString(), // Log regex for debugging
        // });
        console.log(`${path}${subpath}`);

        if (currPath) {
            // If the current path matches the regex, replace it with the new subpath
            const newPath = currPath.replace(regex, `/${path}${subpath}`);
            console.log({ newPath });

            // Navigate only if the path actually changes
            if (newPath !== currPath) {
                navigate(newPath);
            }
        } else {
            // Otherwise, navigate to the new path directly
            navigate(`/${path}${subpath}`);
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

export default RoutedTabs;
