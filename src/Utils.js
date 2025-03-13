import React, { useEffect, useRef } from 'react';
import { Text } from 'grommet';
import {
  StatusCriticalSmall,
  StatusGoodSmall,
  StatusUnknownSmall,
  StatusWarningSmall,
} from 'grommet-icons';

/* eslint no-console: ["warn", { "allow": ["warn", "error"] }] */

const Collator = new Intl.Collator(undefined, { numeric: true });

/**
 * Return whether or not 2 arrays have the same contents as each other.
 * @param a - The first array.
 * @param b - The second array.
 */
const arraysEqual = (a, b) =>
  a.length === b.length && a.every((val, idx) => val === b[idx]);

/**
 * Return string, converting input string in "camelCase" to Title-Case.
 * If the input string's first character is a capital (which is not Camel-Case)
 * then the returned string will contain a leading space.  This does not matter
 * for use in HTML, so it is left to the caller to decide if it needs to be
 * stripped.
 *
 * @param {string} camelCase
 */
const camel2Title = (camelCase) =>
  camelCase
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase());

/**
 * https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
 *
 * Return boolean, indicating whether the value is a valid decimal number.
 * @param {*} value - any
 */
const isNumeric = (value) => !Number.isNaN(value - parseFloat(value));

/**
 * Return a naturally-sorted array.
 * @param array - The unsorted array.
 * @param getComparableValue - Optional function to run against each item of
 *                             the array to get the value we want to sort on.
 */
const naturalSort = (array, getComparableValue = (x) => x) =>
  array.sort((a, b) =>
    Collator.compare(getComparableValue(a), getComparableValue(b)),
  );

const formatDataTableHeader = (header) => (
  <Text weight="bold" size="small">
    {header}
  </Text>
);

const formatDataTableContent = (content) => <Text size="small">{content}</Text>;

const formatDataTable = (data) => {
  const keys = Object.keys(data[0]);
  /* eslint-disable no-param-reassign */
  data.forEach((item) => {
    item[keys[0]] = formatDataTableHeader(item[keys[0]]);
    for (let idx = 1; idx < keys.length; idx += 1) {
      item[keys[idx]] = formatDataTableContent(item[keys[idx]]);
    }
  });
  /* eslint-enable no-param-reassign */
};

/* eslint-disable max-len */
/**
 *
 * @param {*} cmd CLI command string
 *
 * Place italic markup around the property value in a CLI command string.
 *
 * For example:
 *  Input cmd: 'show indict [chassis=GEOID | pnum=0]'
 *  Return   : '<pre>show indict [chassis=<i>GEOID</i> | pnum=<i>0</i>]</pre>'
 *
 * Since Markdown code block (```) does not allow italics, this is acheived
 * by embedding HTML syntax in the Markdown, e.g. <pre>prop=<i>VAL</i></pre>
 *
 * Example: This procedure converts:
 *
 * modify chassis target=GEOID [serial=SERIAL_NUMBER] [{type={31-34}} | {part_num=PRODUCT_ID model=PRODUCT_NAME}]"
 *
 * to:
 *
 * <pre>modify chassis target=<i>GEOID</i> [serial=<i>SERIAL_NUMBER</i>] [{type={<i>31-34</i>}} | {part_num=<i>PRODUCT_ID</i> model=<i>PRODUCT_NAME</i>}] [verbose]</pre>
 */
/* eslint-enable max-len */
const markdownItalicizePropVal = (cmd) =>
  // append space for 'command prop=VAL', i.e. VAL followed by end of string
  // eslint-disable-next-line prefer-template
  `<pre>${cmd} `
    .replace(/=([{[]?)(.*?)([ \]}])/g, '=$1<i>$2</i>$3') // wrap values with HTML italics
    .replace(/([_[\](){}|])/g, '\\$1') + // escape markdown symbols
  '</pre>';

// if we don't want italicized markdown, then display it as code block.
const markdownCommand = (cmd, italicize) =>
  italicize ? markdownItalicizePropVal(cmd) : `\`\`\`${cmd}\`\`\``;

const markdownCli = (cli) =>
  cli && cli.length
    ? `* ${cli.map((item) => markdownCommand(item, true)).join('\n* ')}`
    : '';

// https://stackoverflow.com/questions/39542872/escaping-discord-subset-of-markdown
const escapeMarkdown = (text) => {
  const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
  const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
  // replace any single linefeed, or any sequence of multiple linefeeds
  // with or without enclosed whitespace, with a single pair of HTML breaks.
  const htmlLineBreak = escaped.replace(/\n(\s*\n)*/g, '<br /><br />');
  return htmlLineBreak;
};

// Default styling for headers leaves too much margin. Shrink it.
const styleHeading = {
  style: { marginTop: 'auto', marginBottom: 'auto' },
};

// Info markdown creates these headings; style them the same way
const infoStyle = {
  headings: {
    h3: { props: styleHeading },
    h4: { props: styleHeading },
    h5: { props: styleHeading },
  },
  cli: {
    // <pre> used only when italicizing;
    //  - apply word-wrapping and collapse consecutive spaces into one
    //  - reduce the margin between list items
    // <ul>
    //  - reduce font size (medium looks good)
    pre: { props: { style: { whiteSpace: 'normal', margin: '0' } } },
    ul: { props: { style: { fontSize: 'medium' } } },
  },
};

/*
 * Custom hook: return a 'Ref' flag, that indicates if the component is mounted.
 * Usage: When an async operation completes after the component is unmounted,
 * skip changes in state for the unmounted component.
 */
const useIsMounted = () => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
};

// Custom hook: capture value from previous render
const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

// Convert the Integrated Event Severity level to an icon
/* eslint-disable no-nested-ternary */
const statusIcon = (level) =>
  level <= 2 ? (
    <StatusGoodSmall color="status-ok" size="small" />
  ) : level <= 4 ? (
    <StatusWarningSmall color="status-warning" size="small" />
  ) : level <= 7 ? (
    <StatusCriticalSmall color="status-critical" size="small" />
  ) : (
    <StatusUnknownSmall color="status-unknown" size="small" />
  );
/* eslint-enable no-nested-ternary */

export const UseMonitorResponseMessage = (res, extBaseHdlr) =>
  res.status === 204 || res.status === 201
    ? // Type of success response with no explicit message in the body
    [{ health: 'OK', msg: 'Success!' }]
    : res
      .json()
      .then((json) => json.error)
      // Response body isn't JSON, so we can't explain the failure.
      .catch(() => [
        { health: 'Critical', msg: 'An internal error occurred.' },
      ]);

export {
  arraysEqual,
  camel2Title,
  infoStyle,
  isNumeric,
  naturalSort,
  formatDataTable,
  formatDataTableHeader,
  formatDataTableContent,
  markdownCli,
  escapeMarkdown,
  useIsMounted,
  usePrevious,
  statusIcon,
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateName = (name) => {
  return name.length >= 2 && name.length <= 50;
};

export const validateFeedback = (feedback) => {
  return feedback.length >= 10 && feedback.length <= 1000;
};
