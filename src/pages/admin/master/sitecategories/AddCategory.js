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
import { ConfirmOperation } from '../../../../components';
import { SessionContext } from '../../../../context/session';


const AddCategory = ({ onClose, onSave }) => {
  const { client } = useContext(SessionContext);
  const [formValues, setFormValues] = useState({
    CategoryName: '',
    Description: '',
    IsActive: 1,
  });

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <FormField
        name="CategoryName"
        label="Category Name"
        required
      >
        <TextInput name="CategoryName" />
      </FormField>

      <FormField
        name="Description"
        label="Description"
      >
        <TextArea name="Description" />
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
      title="Add Category"
      text={formContent}
      onConfirm={() => client.post('/api/site-categories', formValues)}
      onClose={onClose}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onSuccess={onSave}
    />
  );
};

AddCategory.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddCategory;