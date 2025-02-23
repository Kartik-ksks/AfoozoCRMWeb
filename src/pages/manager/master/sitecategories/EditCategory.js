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
import { ConfirmOperation } from '../../../../components';
import { SessionContext } from '../../../../context/session';

const EditCategory = ({ category, onClose, onSave }) => {
  const { client } = useContext(SessionContext);
  const [formValues, setFormValues] = useState({
    CategoryName: category.CategoryName,
    Description: category.Description,
    IsActive: category.IsActive,
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
      title="Edit Category"
      text={formContent}
      onConfirm={() => client.put(`/api/site-categories/${category.CategoryId}`, {
        CategoryName: formValues.CategoryName,
        Description: formValues.Description,
        IsActive: formValues.IsActive,
      })}
      onClose={onClose}
      yesPrompt="Save"
      noPrompt="Cancel"
      estimatedTime={5}
      onSuccess={onSave}
    />
  );
};

EditCategory.propTypes = {
  category: PropTypes.shape({
    CategoryId: PropTypes.number.isRequired,
    CategoryName: PropTypes.string.isRequired,
    Description: PropTypes.string,
    IsActive: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditCategory;