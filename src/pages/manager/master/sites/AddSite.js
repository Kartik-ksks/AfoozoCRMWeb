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
  Grid,
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
    return client.post('/api/sites', formValues, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const formContent = (
    <Box overflow="auto" height={{ max: 'large' }}>
      <Form value={formValues} onChange={setFormValues}>
        <Grid
          columns={['1/2', '1/2']}
          gap="medium"
          pad="medium"
        >
          {/* Basic Information */}
          <Box gap="small">
            <FormField name="SiteName" label="Site Name" required>
              <TextInput name="SiteName" placeholder="Enter site name" />
            </FormField>

            <FormField name="CategoryId" label="Site Category Type" required>
              <Select
                name="CategoryId"
                options={siteTypes}
                labelKey="label"
                valueKey="value"
                placeholder="Select category"
                onChange={({ value }) => setFormValues({
                  ...formValues,
                  CategoryId: value.id,
                  CategoryName: value.value
                })}
              />
            </FormField>

            <FormField name="DisplayOrderNo" label="Display Order No">
              <TextInput
                name="DisplayOrderNo"
                type="number"
                placeholder="Enter display order"
              />
            </FormField>

            <FormField name="Details" label="Details">
              <TextArea
                name="Details"
                placeholder="Enter site details"
                rows={4}
              />
            </FormField>
          </Box>

          {/* Contact Information */}
          <Box gap="small">
            <FormField name="ContactPerson" label="Contact Person">
              <TextInput
                name="ContactPerson"
                placeholder="Enter contact person name"
              />
            </FormField>

            <FormField name="ContactPersonEmail" label="Contact Person Email">
              <TextInput
                name="ContactPersonEmail"
                type="email"
                placeholder="Enter email"
              />
            </FormField>

            <FormField name="ContactPersonMobile" label="Contact Person Mobile">
              <TextInput
                name="ContactPersonMobile"
                placeholder="Enter mobile number"
              />
            </FormField>

            <FormField name="ContactPersonDesig" label="Contact Person Designation">
              <TextInput
                name="ContactPersonDesig"
                placeholder="Enter designation"
              />
            </FormField>
          </Box>

          {/* Address Information */}
          <Box gap="small">
            <FormField name="SiteAddress" label="Site Address">
              <TextArea
                name="SiteAddress"
                placeholder="Enter site address"
                rows={3}
              />
            </FormField>

            <Grid columns={['1/2', '1/2']} gap="small">
              <FormField name="City" label="City">
                <TextInput name="City" placeholder="Enter city" />
              </FormField>

              <FormField name="State" label="State">
                <TextInput name="State" placeholder="Enter state" />
              </FormField>
            </Grid>

            <Grid columns={['1/2', '1/2']} gap="small">
              <FormField name="Country" label="Country">
                <TextInput name="Country" placeholder="Enter country" />
              </FormField>

              <FormField name="Pincode" label="Pincode">
                <TextInput name="Pincode" placeholder="Enter pincode" />
              </FormField>
            </Grid>
          </Box>

          {/* Additional Contact Details */}
          <Box gap="small">
            <FormField name="Tel" label="Telephone">
              <TextInput name="Tel" placeholder="Enter telephone" />
            </FormField>

            <FormField name="Mobile" label="Mobile">
              <TextInput name="Mobile" placeholder="Enter mobile" />
            </FormField>

            <FormField name="EmailId" label="Email ID">
              <TextInput
                name="EmailId"
                type="email"
                placeholder="Enter email"
              />
            </FormField>

            <FormField name="WebSite" label="Website">
              <TextInput
                name="WebSite"
                placeholder="Enter website URL"
              />
            </FormField>

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
        </Grid>
      </Form>
    </Box>
  );

  return (
    <ConfirmOperation
      title="Add Site"
      text={formContent}
      onConfirm={handleSubmit}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onClose={onClose}
      onSuccess={onSave}
    />
  );
};

AddSite.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddSite;