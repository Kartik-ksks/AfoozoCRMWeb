import { Button } from 'grommet';
import PropTypes from 'prop-types';

const isString = (s) => typeof s === 'string' || s instanceof String;

const csvUri = (fields, data) => {
  const header = fields.join(',');
  const dataStr = data
    .map((rec) =>
      fields
        .map((field) =>
          isString(rec[field])
            ? `"${rec[field] ? rec[field].replace(/(["'\\])/g, '$1$1') : ''}"`
            : rec[field],
        )
        .join(','),
    )
    .join('\n');

  const dataUri = `data:text/csv;charset=utf-8, ${encodeURIComponent(
    `${header}\n${dataStr}`,
  )}`;
  return dataUri;
};

const jsonUri = (data) => {
  const dataStr = JSON.stringify(data);
  const dataUri = `data:application/json;charset=utf-8, ${encodeURIComponent(
    dataStr,
  )}`;
  return dataUri;
};

export const SaveAsButton = ({ filename, data, format, fields, ...rest }) => {
  if (format === 'CSV' && !fields?.length) {
    console.error('SaveAsButton: CSV format is missing fields array');
  }

  const dataUri = format === 'JSON' ? jsonUri(data) : csvUri(fields, data);

  return (
    <Button
      href={dataUri}
      download={`${filename}.${format.toLowerCase()}`}
      {...rest}
    />
  );
};

SaveAsButton.propTypes = {
  filename: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.arrayOf(PropTypes.object).isRequired, // array of objects
  format: PropTypes.oneOf(['CSV', 'JSON', 'TXT']).isRequired,
  fields: PropTypes.arrayOf(PropTypes.string), // required for CSV format
};

SaveAsButton.defaultProps = {
  fields: undefined, // required for CSV
};
