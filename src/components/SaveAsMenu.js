import { Menu } from 'grommet';
import { DocumentDownload } from 'grommet-icons';
import PropTypes from 'prop-types';
import { SaveAsButton } from './SaveAsButton';

const SaveAsMenu = ({ filename, data, fieldnames }) => {
  return (
    <Menu
      icon={<DocumentDownload />}
      items={['CSV', 'JSON'].map((format) => ({
        label: (
          <SaveAsButton
            key={format}
            plain
            filename={filename}
            data={data}
            format={format}
            fields={fieldnames}
            label={`Save as ${format}`}
          />
        ),
      }))}
    />
  );
};

SaveAsMenu.propTypes = {
  filename: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.arrayOf(PropTypes.object).isRequired, // array of objects
  fieldnames: PropTypes.arrayOf(PropTypes.string).isRequired, // for CSV
};

export default SaveAsMenu;
