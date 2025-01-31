import React, { useState, useContext } from 'react';
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

const AddSite = ({ onClose, onSave }) => {
  const { client } = useContext(SessionContext);
  const [formValues, setFormValues] = useState({
    SiteName: '',
    SiteType: '',
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
    ImagePath: '',
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
      title="Add Site"
      text={formContent}
      onConfirm={() => client.post('/api/sites', formValues)}
      onClose={onClose}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onSuccess={onSave}
    />
  );
};

AddSite.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddSite;