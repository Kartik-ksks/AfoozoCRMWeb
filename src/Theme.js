import { defaultProps } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
import { deepMerge } from 'grommet/utils';

const breakpoints = deepMerge(
  {
    sidebar: {
      value: 576,
    },
    infobar: {
      value: 790,
    },
  },
  deepMerge(defaultProps.theme.global.breakpoints, hpe.global?.breakpoints),
);

const theme = deepMerge(hpe, {
  global: {
    // font object is based on node_modules/grommet-theme-hpe
    font: {
      family: "'Metric', Arial, sans-serif",
      // face: `
      //   @font-face {
      //     font-family: "Metric";
      //     src: url("/fonts/MetricHPE-Web-Regular.woff2") format('woff2');
      //   }
      //   @font-face {
      //     font-family: "Metric";
      //     src: url("/fonts/MetricHPE-Web-Regular.woff2") format('woff2');
      //     font-weight: 400;
      //   }
      //   @font-face {
      //     font-family: "Metric";
      //     src: url("/fonts/MetricHPE-Web-Bold.woff2") format('woff2');
      //     font-weight: 700;
      //   }
      //   @font-face {
      //     font-family: "Metric";
      //     src: url("/fonts/MetricHPE-Web-Semibold.woff2") format('woff2');
      //     font-weight: 600;
      //   }
      //   @font-face {
      //     font-family: "Metric";
      //     src: url("/fonts/MetricHPE-Web-Medium.woff2") format('woff2');
      //     font-weight: 500;
      //   }
      //   @font-face {
      //     font-family: "Metric";
      //     src: url("/fonts/MetricHPE-Web-Light.woff2") format('woff2');
      //     font-weight: 100;
      //   }`,
      size: '15px',
      height: '20px',
    },
    breakpoints,
    colors: {
      brand: '#B23A48',          // Deeper red for brand
      'brand-contrast': '#FFFFFF',
      'neutral-1': '#2C3E50',    // Dark blue-gray
    }
  },
  button: {
    hover: {
      background: { color: 'rgba(255, 255, 255, 0.1)' },
    },
  },
});

export default theme;
