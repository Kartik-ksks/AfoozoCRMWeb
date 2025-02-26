import React, { useState, useContext, useRef } from 'react';
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
import { SessionContext } from '../../../../context/session';

const EditSite = ({ site, siteTypes = [], onClose, onSave }) => {
  const { client } = useContext(SessionContext);
  const fileInputRef = useRef(null);

  const [formValues, setFormValues] = useState({
    ...site,
    CategoryId: siteTypes?.find(t => t.value === site?.CategoryName)?.id || '',
    CategoryName: site?.CategoryName || '',
  });
  const [imageFile, setImageFile] = useState(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    handleImageFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleImageFile = (file) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      setFormValues(prev => ({ ...prev, ImagePath: file.name }));
    } else {
      alert('Only PNG and JPEG files are allowed.');
    }
  };

  const handleSubmit = () => {
    const selectedCategory = siteTypes?.find(t => t.id === formValues.CategoryId);
    const updatedSite = {
      ...formValues,
      CategoryName: selectedCategory?.value || formValues.CategoryName,
    };
    return onSave(updatedSite);
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
              <TextInput
                name="SiteName"
                placeholder="Enter site name"
              />
            </FormField>

            <FormField name="CategoryId" label="Site Category Type" required>
              <Select
                name="CategoryId"
                options={siteTypes || []}
                labelKey="label"
                valueKey={{ key: 'id', reduce: true }}
                placeholder="Select category"
                value={formValues.CategoryId}
                onChange={({ value }) => {
                  const selectedCategory = siteTypes.find(t => t.id === value);
                  setFormValues({
                    ...formValues,
                    CategoryId: value,
                    CategoryName: selectedCategory?.value || ''
                  });
                }}
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

            {/* Image Upload */}
            <FormField name="ImagePath" label="Site Image">
              <Box
                direction="row"
                align="center"
                gap="small"
                onClick={handleImageClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                border={{ color: 'border', size: '1px' }}
                round="small"
                pad="small"
                style={{ cursor: 'pointer' }}
              >
                <Upload />
                <TextInput
                  name="ImagePath"
                  value={formValues.ImagePath || ''}
                  placeholder="Click or drag to upload image"
                  readOnly
                  plain
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </Box>
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
                <TextInput
                  name="City"
                  placeholder="Enter city"
                />
              </FormField>

              <FormField name="State" label="State">
                <TextInput
                  name="State"
                  placeholder="Enter state"
                />
              </FormField>
            </Grid>

            <Grid columns={['1/2', '1/2']} gap="small">
              <FormField name="Country" label="Country">
                <TextInput
                  name="Country"
                  placeholder="Enter country"
                />
              </FormField>

              <FormField name="Pincode" label="Pincode">
                <TextInput
                  name="Pincode"
                  placeholder="Enter pincode"
                />
              </FormField>
            </Grid>
          </Box>

          {/* Additional Contact Details */}
          <Box gap="small">
            <FormField name="Tel" label="Telephone">
              <TextInput
                name="Tel"
                placeholder="Enter telephone"
              />
            </FormField>

            <FormField name="Mobile" label="Mobile">
              <TextInput
                name="Mobile"
                placeholder="Enter mobile"
              />
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
      title="Edit Site"
      text={formContent}
      onConfirm={handleSubmit}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onClose={onClose}
      onSuccess={onClose}
      progressLabel={`Updating site ${formValues.SiteName}...`}
    />
  );
};

EditSite.propTypes = {
  site: PropTypes.object.isRequired,
  siteTypes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.string,
    label: PropTypes.string,
  })),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

EditSite.defaultProps = {
  siteTypes: [],
};

export default EditSite;