import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Tip, Text } from 'grommet';
import { FormDown, FormNext } from 'grommet-icons';
import { RoutedButton } from '../components';
import { useNavigate } from 'react-router-dom';

const MultiLevelMenu = ({ menu, compact }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasItems = menu.items && menu.items.length > 0;
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (hasItems && !compact) {
      e.preventDefault();
      setIsOpen(!isOpen);
      navigate(`/${menu.path}`);
    } else if (menu.path) {
      navigate(`/${menu.path}`);
    }
  };

  const menuButton = (
    <Box pad="xsmall">
      <RoutedButton
        path={menu.path}
        onClick={handleClick}
        hoverIndicator
        plain
        border={{ side: 'bottom', color: 'rgba(255, 255, 255, 0.1)', size: '1px' }}
      >
        <Box
          direction="row"
          align="center"
          pad={{ horizontal: 'small', vertical: 'xsmall' }}
          gap="small"
          width="100%"
          height="48px"
        >
          <Box basis="32px" flex={false} justify="center">
            {menu.Icon}
          </Box>
          {!compact && (
            <Box
              flex
              direction="row"
              justify="between"
              align="center"
              width={{ max: '180px' }}
            >
              <Text size="medium" weight="normal">
                {menu.title}
              </Text>
              {hasItems && (
                <Box margin={{ left: 'xsmall' }}>
                  {isOpen ? <FormDown size="small" /> : <FormNext size="small" />}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </RoutedButton>
    </Box>
  );

  return (
    <Box>
      {compact ? (
        <Tip content={menu.title} dropProps={{ align: { left: 'right' } }}>
          {menuButton}
        </Tip>
      ) : (
        menuButton
      )}

      {hasItems && isOpen && !compact && (
        <Box>
          {menu.items.map((item) => (
            <Box
              key={item.path || item.title}
              border={{
                side: 'left',
                color: 'rgba(255, 255, 255, 0.2)',
                size: '2px'
              }}
              margin={{ left: 'medium' }}
              background="rgba(0, 0, 0, 0.1)"
            >
              <MultiLevelMenu
                menu={item}
                compact={compact}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

MultiLevelMenu.propTypes = {
  menu: PropTypes.shape({
    title: PropTypes.string.isRequired,
    path: PropTypes.string,
    Icon: PropTypes.node,
    items: PropTypes.array,
  }).isRequired,
  compact: PropTypes.bool,
};

MultiLevelMenu.defaultProps = {
  compact: false,
};

export default MultiLevelMenu;