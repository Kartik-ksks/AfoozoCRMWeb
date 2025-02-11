import React, { useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Form,
  FormField,
  TextInput,
  TextArea,
  CheckBox,
  Grid,
  Drop,
  Select,
  Button,
} from 'grommet';
import { SessionContext, useMonitor } from '../../../../context/session';
import QLayer from '../../../../components/QLayer';
import ConfirmOperation from '../../../../components/ConfirmOperation';
import { Upload } from 'grommet-icons';


const EditSite = ({ site, onClose, onSave }) => {
  const { client } = useContext(SessionContext);
  const fileInputRef = useRef(null);
  const [formValues, setFormValues] = useState({
    SiteName: site.SiteName,
    SiteType: site.SiteType,
    DisplayOrderNo: site.DisplayOrderNo,
    Details: site.Details,
    ContactPerson: site.ContactPerson,
    ContactPersonEmail: site.ContactPersonEmail,
    ContactPersonMobile: site.ContactPersonMobile,
    ContactPersonDesig: site.ContactPersonDesig,
    SiteAddress: site.SiteAddress,
    City: site.City,
    State: site.State,
    Country: site.Country,
    Pincode: site.Pincode,
    Tel: site.Tel,
    Mobile: site.Mobile,
    EmailId: site.EmailId,
    IsActive: site.IsActive,
    WebSite: site.WebSite,
    ImagePath: site.ImagePath,
    CategoryId: site.CategoryId,
    CategoryName: site.CategoryName,
  });
  const [imageFile, setImageFile] = useState(null);
  const [siteTypes, setSiteTypes] = useState([]);
  const [showLayer, setShowLayer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useMonitor(
    client,
    ['/api/site-categories'],
    ({ ['/api/site-categories']: categories }) => {
      if (categories) {
        setSiteTypes(categories.map(category => ({
          value: category.CategoryName,
          label: category.CategoryName,
        })));
      }
    }
  );

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

  const handleImageFile = (file) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImageFile(file);
      setFormValues(prev => ({ ...prev, ImagePath: file.name }));
    } else {
      alert('Only PNG and JPEG files are allowed.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="small" pad="small">
        <Grid columns={['1/3', '1/3', '1/3']} gap="small">
          <FormField name="SiteName" label="Site Name" required>
            <TextInput name="SiteName" />
          </FormField>
          <FormField name="SiteType" label="Site Type" required>
            <Select
              options={siteTypes}
              value={formValues.SiteType}
              onChange={({ value }) => setFormValues({ ...formValues, SiteType: value })}
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
            <TextInput name="ContactPersonEmail" />
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
            <TextInput name="EmailId" />
          </FormField>
          <FormField name="WebSite" label="Website">
            <TextInput name="WebSite" />
          </FormField>
          <FormField name="ImagePath" label="Image Path">
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
                value={formValues.ImagePath}
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
        </Grid>
      </Box>
    </Form>
  );

  return (
    <ConfirmOperation
      title="Edit Site"
      text={formContent}
      onConfirm={() => client.put(`/api/sites/${site.SiteId}`, formValues)}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onSuccess={onSave}
    />
  );
};

EditSite.propTypes = {
  site: PropTypes.shape({
    SiteId: PropTypes.number.isRequired,
    SiteName: PropTypes.string.isRequired,
    SiteType: PropTypes.string,
    DisplayOrderNo: PropTypes.number,
    Details: PropTypes.string,
    ContactPerson: PropTypes.string,
    ContactPersonEmail: PropTypes.string,
    ContactPersonMobile: PropTypes.string,
    ContactPersonDesig: PropTypes.string,
    SiteAddress: PropTypes.string,
    City: PropTypes.string,
    State: PropTypes.string,
    Country: PropTypes.string,
    Pincode: PropTypes.string,
    Tel: PropTypes.string,
    Mobile: PropTypes.string,
    EmailId: PropTypes.string,
    IsActive: PropTypes.number.isRequired,
    WebSite: PropTypes.string,
    ImagePath: PropTypes.string,
    CategoryId: PropTypes.number,
    CategoryName: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditSite;