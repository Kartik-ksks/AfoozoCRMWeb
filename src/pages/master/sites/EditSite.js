import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Form,
  FormField,
  TextInput,
  TextArea,
  CheckBox,
} from 'grommet';
import { ConfirmOperation } from '../../../components';
import { SessionContext } from '../../../context/session';

const EditSite = ({ site, onClose, onSave }) => {
  const { client } = useContext(SessionContext);
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
  });

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <FormField name="SiteName" label="Site Name" required>
        <TextInput name="SiteName" />
      </FormField>
      <FormField name="SiteType" label="Site Type">
        <TextInput name="SiteType" />
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
        <TextInput name="ImagePath" />
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
    </Form>
  );

  return (
    <ConfirmOperation
      title="Edit Site"
      text={formContent}
      onConfirm={() => client.put(`/api/sites/${site.SiteId}`, formValues)}
      onClose={onClose}
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
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditSite;