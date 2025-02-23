import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';

export const Context = createContext({});
Context.displayName = 'DashboardContext'; // for devTools

export const Provider = (props) => {
  // console.log('[DashboardContext] Provider', props);

  // Initial values are obtained from the props
  const { dashboard: initialDashboard = [], children = null} = props;

  // Use State to keep the values
  const [components, setComponents] = useState(null);

  useEffect(() => {
    if (!initialDashboard) return;

    const validateInput = (dashboard) => {
      // console.log('validateInput:', { dashboard });
      const input = dashboard;
      if (!input) return [];
      if (typeof input !== 'object' || input.length === 0) return [];

      // check for keys in every array element
      const neededKeys = ['id', 'name', 'props', 'show'];
      if (
        !input.every((item) =>
          neededKeys.every((key) => Object.keys(item).includes(key)),
        )
      )
        return [];

      // check every value in every object
      if (
        !input.every(
          (item) =>
            typeof item.id === 'string' ||
            typeof item.name === 'string' ||
            typeof item.props === 'object' ||
            typeof item.show === 'boolean',
        )
      )
        return [];

      return input;
    };

    setComponents(validateInput(initialDashboard));
  }, [initialDashboard, setComponents]); // initialize on first mount only

  useEffect(() => {
    if (components === null) return;

    const saveDashboard = [];
    components.forEach(
      (item) =>
        item.show &&
        saveDashboard.push({
          id: item.id,
          name: item.name,
          props: item.props,
          show: true,
        }),
    );
    window.localStorage.setItem('dashboard', JSON.stringify(saveDashboard));
  }, [components]);

  // addComponent changes state, so MUST be called from within a useEffect()
  const addComponent = useCallback((id, name, _props) => {
    // console.log('addComponent', { id, name, _props });
    const saveProps = { ..._props }; // shallow copy
    // remove session-specific info
    delete saveProps.client; // reference deleted from props
    delete saveProps.userRole; // reference deleted from props

    const newComponent = {
      id,
      name,
      props: saveProps,
      show: false,
    };

    setComponents((c) =>
      c === null
        ? [newComponent]
        : !c.find((item) => item.id === id)
        ? c.concat([newComponent])
        : c,
    );
  }, []);

  // removeComponent changes state, so MUST be called from within a useEffect()
  const removeComponent = useCallback(
    (id) => {
      // console.log('[DashboardContext] removeComponent', id);

      setComponents((c) =>
        c === null ? [] : c.filter((item) => item.id !== id),
      );
    },
    [setComponents],
  );

  const removeAllComponents = useCallback(() => {
    setComponents([]);
    window.localStorage.removeItem('dashboard');
  }, [setComponents]);

  const showComponent = useCallback(
    (id) => {
      // console.log('[DashboardContext] showComponent', {
      //   components,
      //   id,
      // });
      if (components === null) return;

      const found = components.find((item) => item.id === id);
      if (found !== undefined) found.show = true;
      // else console.log(`${id} not found in`, { components });

      const saveDashboard = [];
      components.forEach(
        (item) =>
          item.show &&
          saveDashboard.push({
            id: item.id,
            name: item.name,
            props: item.props,
            show: true,
          }),
      );
      window.localStorage.setItem('dashboard', JSON.stringify(saveDashboard));
    },
    [components],
  );

  const hideComponent = useCallback(
    (id) => {
      // console.log('[DashboardContext] hideComponent', id);
      if (components === null) return;

      const found = components.find((item) => item.id === id);
      if (found !== undefined) {
        // removeComponent will update components state and force a re-render
        if (window.location.hash === '#/') removeComponent(found.id);
        else found.show = false;
      }
      // else console.log(`${id} not found in`, components);
    },
    [components, removeComponent],
  );

  const isShowingComponent = useCallback(
    (id) => Boolean(components?.find((item) => item.id === id && item.show)),
    [components],
  );

  const numPinnedComponents = useCallback(
    () => Number(components?.filter((item) => item.show).length),
    [components],
  );

  // Make the context object:
  const providedContext = useMemo(() => {
    const useAddComponent = (id, name, _props) => {
      // console.log('[DashboardContext] useAddComponent', id);
      useEffect(() => addComponent(id, name, _props));
    };

    // removeComponent changes state, so MUST be called from within useEffect()
    const useRemoveComponent = (id) => {
      // console.log('[DashboardContext] useRemoveComponent', id);
      useEffect(() => removeComponent(id));
    };

    return {
      components,
      useAddComponent,
      useRemoveComponent,
      addComponent,
      removeComponent,
      removeAllComponents,
      showComponent,
      hideComponent,
      isShowingComponent,
      numPinnedComponents,
    };
  }, [
    addComponent,
    components,
    hideComponent,
    isShowingComponent,
    numPinnedComponents,
    removeAllComponents,
    removeComponent,
    showComponent,
  ]);

  // pass the value in provider and return
  return (
    <Context.Provider value={providedContext}>{children}</Context.Provider>
  );
};

export const { Consumer } = Context;

Provider.propTypes = {
  dashboard: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      show: PropTypes.bool,
    }),
  ),
  children: PropTypes.node,
};

