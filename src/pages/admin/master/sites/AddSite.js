import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Form,
  FormField,
  TextInput,
  TextArea,
  CheckBox,
  Select,
} from 'grommet';
import { Upload } from 'grommet-icons';
import { ConfirmOperation } from '../../../../components';
import { SessionContext, useMonitor } from '../../../../context/session';

const AddSite = ({ onClose, onSave }) => {
  const { client } = useContext(SessionContext);
  const [formValues, setFormValues] = useState({
    SiteName: '',
    CategoryId: '',
    CategoryName: '',
    DisplayOrderNo: '',
    Details: '',
    ContactPerson: '',
    ContactPersonEmail: '',
    ContactPersonMobile: '',
    ContactPersonDesig: '',
    SiteAddress: '',
    City: '',
    State: '',
    Country: '',
    Pincode: '',
    Tel: '',
    Mobile: '',
    EmailId: '',
    IsActive: 1,
    WebSite: '',
    // ImagePath: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [siteTypes, setSiteTypes] = useState([]);

  useMonitor(
    client,
    ['/api/site-categories'],
    ({ ['/api/site-categories']: categories }) => {
      if (categories) {
        setSiteTypes(categories.map(category => ({
          id: category.CategoryId,
          value: category.CategoryName,
          label: category.CategoryName,
        })));
      }
    }
  );

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      setFormValues(prev => ({ ...prev, ImagePath: file.name }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(formValues).forEach(key => {
      if (key !== 'ImagePath') {
        formData.append(key, formValues[key]);
      }
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return client.post('/api/sites', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="small" pad="small">
        <FormField name="SiteName" label="Site Name" required>
          <TextInput name="SiteName" />
        </FormField>

        <FormField name="CategoryId" label="Site Category Type" required>
          <Select
            name="CategoryId"
            options={siteTypes}
            labelKey="label"
            valueKey="value"
            onChange={({ value }) => setFormValues({ ...formValues, CategoryId: value.id, CategoryName: value.id })}
          />
        </FormField>

        <FormField name="DisplayOrderNo" label="Display Order No">
          <TextInput name="DisplayOrderNo" type="number" />
        </FormField>

        <FormField name="Details" label="Details">
          <TextArea name="Details" />
        </FormField>

        <FormField name="ContactPerson" label="Contact Person">
          <TextInput name="ContactPerson" />
        </FormField>

        <FormField name="ContactPersonEmail" label="Contact Person Email">
          <TextInput name="ContactPersonEmail" type="email" />
        </FormField>

        <FormField name="ContactPersonMobile" label="Contact Person Mobile">
          <TextInput name="ContactPersonMobile" />
        </FormField>

        <FormField name="ContactPersonDesig" label="Contact Person Designation">
          <TextInput name="ContactPersonDesig" />
        </FormField>

        <FormField name="SiteAddress" label="Site Address">
          <TextArea name="SiteAddress" />
        </FormField>

        <FormField name="City" label="City">
          <TextInput name="City" />
        </FormField>

        <FormField name="State" label="State">
          <TextInput name="State" />
        </FormField>

        <FormField name="Country" label="Country">
          <TextInput name="Country" />
        </FormField>

        <FormField name="Pincode" label="Pincode">
          <TextInput name="Pincode" />
        </FormField>

        <FormField name="Tel" label="Telephone">
          <TextInput name="Tel" />
        </FormField>

        <FormField name="Mobile" label="Mobile">
          <TextInput name="Mobile" />
        </FormField>

        <FormField name="EmailId" label="Email ID">
          <TextInput name="EmailId" type="email" />
        </FormField>

        <FormField name="WebSite" label="Website">
          <TextInput name="WebSite" />
        </FormField>

        {/* <FormField name="ImagePath" label="Site Image">
          <Box
            direction="row"
            align="center"
            gap="small"
            border={{ color: 'border', size: '1px' }}
            round="small"
            pad="small"
          >
            <Upload />
            <TextInput
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
              plain
            />
          </Box>
        </FormField> */}

        <FormField name="IsActive">
          <CheckBox
            name="IsActive"
            label="Active"
            checked={formValues.IsActive === 1}
            onChange={(e) => setFormValues({
              ...formValues,
              IsActive: e.target.checked ? 1 : 0
            })}
          />
        </FormField>
      </Box>
    </Form>
  );

  return (
    <ConfirmOperation
      title="Add Site"
      text={formContent}
      onConfirm={() => client.post('/api/sites', formValues)}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onClose={() => onClose()}
      onSuccess={() => onSave()}
    />
  );
};


AddSite.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddSite;