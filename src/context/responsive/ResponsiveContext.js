import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { ResponsiveContext as GrommetResponsiveContext } from 'grommet';
import PropTypes from 'prop-types';
import theme from '../../Theme';

export const Context = createContext({});
Context.displayName = 'ResponsiveContext';

export const Provider = ({ children = null }) => {
  // Initial values are obtained from the props
  /* See theme.global.breakpoints:
   *   xxsmall, xsmall, small, medium, large, xlarge
   */
  const width = useContext(GrommetResponsiveContext);

  // isBreak() is independent of breakpoint labels
  const { breakpoints } = theme.global;
  // const isBreak = px => Object.keys(breakpoints)
  //   .filter(key => breakpoints[key].value <= px)
  //   .includes(width);

  const isBreak = useCallback(
    (widthName) =>
      Object.keys(breakpoints)
        .filter((key) => breakpoints[key].value <= breakpoints[widthName].value)
        .includes(width),
    [breakpoints, width],
  );

  // break when too narrow
  // const isBreakSidebar = () => isBreak(breakpoints.sidebar.value);
  // const isBreakInfobar = () => isBreak(breakpoints.infobar.value);
  const isBreakSidebar = useCallback(() => isBreak('sidebar'), [isBreak]);
  const isBreakInfobar = useCallback(() => isBreak('infobar'), [isBreak]);

  // Make the context object:
  const providedContext = useMemo(
    () => ({
      width,
      isBreak,
      isBreakSidebar,
      isBreakInfobar,
    }),
    [isBreak, isBreakInfobar, isBreakSidebar, width],
  );

  // pass the value in provider and return
  return (
    <Context.Provider value={providedContext}>{children}</Context.Provider>
  );
};

export const { Consumer } = Context;

Provider.propTypes = {
  children: PropTypes.node,
};

