import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
} from 'grommet';

const TileBox = (props) => (
  <Box
    wrap
    direction="row-responsive"
    // Grommet 2.15.2 issue #4631: Replace "gap" with right margin in the
    // contained Tile.
    // Gap causes the last contained Tile to appear mis-aligned when the window
    // width shrinks, so the page renders all Tiles in a single column. Instead,
    // use "right margin" in each Tile.
    // gap="small"
    justify="center"
    margin={{ bottom: 'medium' }}
    {...props}
  />
);

const Tile = ({
  title = null,
  subTitle = null,
  button = null,
  children = null,
  footer = null,
  gap = 'small',
  headingLevel = 3,
  ...rest
}) => (
  <Card
    // See TileBox. Right margin needed for Grommet 2.15.2 issue #4631
    margin={{ bottom: 'small', right: 'small' }}
    background="background-contrast"
    {...rest}
  >
    {title || button ? (
      <CardHeader>
        <Heading level={headingLevel} margin="small">
          {title}
        </Heading>
        <Box style={{ height: 'small' }}>
          {button}
        </Box>
      </CardHeader>
    ) : (
      ''
    )}
    <CardBody pad="xsmall" gap="small">
      {subTitle && (
        <Text margin={{ left: 'small' }}>
          <i>{subTitle}</i>
        </Text>
      )}
      {children}
    </CardBody>
    {footer && <CardFooter background="none">{footer}</CardFooter>}
  </Card>
);

Tile.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  button: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
  children: PropTypes.node,
  footer: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  gap: PropTypes.string,
  headingLevel: PropTypes.string,
};

export { TileBox, Tile };
