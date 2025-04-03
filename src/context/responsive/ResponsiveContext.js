import React, { createContext, useCallback, useContext, useMemo, useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  // isBreak() is independent of breakpoint labels
  const { breakpoints } = theme.global;

  const isBreak = useCallback(
    (widthName) =>
      Object.keys(breakpoints)
        .filter((key) => breakpoints[key].value <= breakpoints[widthName].value)
        .includes(width),
    [breakpoints, width],
  );

  // break when too narrow
  const isBreakSidebar = useCallback(() => isBreak('sidebar'), [isBreak]);
  const isBreakInfobar = useCallback(() => isBreak('infobar'), [isBreak]);
  
  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const mobileBreakpoint = 768;
      setIsMobile(window.innerWidth <= mobileBreakpoint);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);
  
  // Prevent bounce effect on iOS
  useEffect(() => {
    const handleTouchMove = (e) => {
      // Allow scrolling in elements with the class "scroll-enabled"
      if (!e.target.closest('.scroll-enabled')) {
        e.preventDefault();
      }
    };
    
    if (isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile]);

  // Make the context object:
  const providedContext = useMemo(
    () => ({
      width,
      isBreak,
      isBreakSidebar,
      isBreakInfobar,
      isMobile,
      isPortrait
    }),
    [isBreak, isBreakInfobar, isBreakSidebar, width, isMobile, isPortrait],
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

