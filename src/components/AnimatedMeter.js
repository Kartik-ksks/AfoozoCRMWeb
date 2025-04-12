import React, { useEffect, useState } from 'react';
import { Meter } from 'grommet';

const AnimatedMeter = ({ target, color = 'brand', ...props }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = target / 30;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setValue(current);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [target]);

  return (
    <Meter
      values={[{ value, color }]}
      {...props}
    />
  );
};

export default AnimatedMeter;
