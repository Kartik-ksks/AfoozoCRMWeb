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
  const [isTablet, setIsTablet] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

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
  
  // Check for mobile and tablet devices
  useEffect(() => {
    const checkDeviceType = () => {
      const mobileBreakpoint = 768;
      const tabletBreakpoint = 1024;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      setIsMobile(windowWidth <= mobileBreakpoint);
      setIsTablet(windowWidth > mobileBreakpoint && windowWidth <= tabletBreakpoint);
      setIsPortrait(windowHeight > windowWidth);
      setViewportHeight(windowHeight);
      
      // Update CSS custom properties for viewport height (vh issues on mobile)
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    // Initial check
    checkDeviceType();
    
    // Add event listeners
    window.addEventListener('resize', checkDeviceType);
    window.addEventListener('orientationchange', () => {
      // Delay the update slightly to account for browser calculations
      setTimeout(checkDeviceType, 100);
    });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDeviceType);
      window.removeEventListener('orientationchange', () => {
        setTimeout(checkDeviceType, 100);
      });
    };
  }, []);
  
  // Improve scrolling on iOS
  useEffect(() => {
    const handleTouchMove = (e) => {
      // Only prevent default if we're not in a scrollable element
      if (!e.target.closest('.scroll-enabled') && !e.target.closest('[data-scrollable="true"]')) {
        e.preventDefault();
      }
    };
    
    if (isMobile) {
      // Add class to body for mobile-specific styling
      document.body.classList.add('mobile-device');
      
      // Prevent elastic scroll on iOS
      document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
    } else {
      document.body.classList.remove('mobile-device');
    }
    
    return () => {
      document.body.classList.remove('mobile-device');
      document.body.removeEventListener('touchmove', handleTouchMove);
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
      isTablet,
      isPortrait,
      viewportHeight
    }),
    [isBreak, isBreakInfobar, isBreakSidebar, width, isMobile, isTablet, isPortrait, viewportHeight],
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

