import React, { useContext } from 'react';
import { Layer, Spinner, ThemeContext } from 'grommet';
import { ResponsiveContext } from '../context/responsive';

export const LoadingLayer = () => {
  const { isBreak } = useContext(ResponsiveContext);

  // if we are less than the 'small' breakpoint
  const radius = isBreak('small') ? 'small' : 'medium';

  return (
    <ThemeContext.Extend
      value={{
        layer: {
          container: { elevation: 'none' },
        },
      }}
    >
      <Layer
        data-id="id-loading-layer"
        background="none"
        modal={false}
        responsive={false}
      >
        <Spinner size={radius} />
      </Layer>
    </ThemeContext.Extend>
  );
};