import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  CheckBox,
  TextArea,
  Button,
  FileInput,
  Image,
  Grid,
  Notification,
} from 'grommet';
import { Upload, StatusGood } from 'grommet-icons';
import { SessionContext } from '../../../context/session';
import Toast from '../../../components/Toast';

const ChecklistItems = ({ categories, siteId }) => {
  const { client } = useContext(SessionContext);
  const [responses, setResponses] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleImageUpload = async (itemId, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await client.post('/api/checklist/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResponses(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          image: response.data.url
        }
      }));
    } catch (error) {
      setNotification({
        status: 'critical',
        message: 'Failed to upload image'
      });
    }
  };

  const validateResponses = () => {
    const missingRequired = [];

    categories.forEach(category => {
      category.ChecklistItems.forEach(item => {
        if (item.IsRequired && !responses[item.ItemId]?.done) {
          missingRequired.push({
            category: category.CategoryName,
            question: item.Question
          });
        }
      });
    });

    if (missingRequired.length > 0) {
      setToast({
        status: 'critical',
        message: `Required fields missing:${missingRequired.map(item =>
          `\n• ${item.category}: ${item.question}`
        ).join('')}`
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateResponses()) {
      return;
    }

    setLoading(true);
    try {
      const submissionPromises = Object.entries(responses).map(([itemId, response]) => {
        return {
          itemId,
          done: response.done || false,
          comment: response.comment || '',
          image: response.image || ''
        }
      });
      await client.post('/api/checklist/submit', submissionPromises)

      // await Promise.all(submissionPromises);

      setNotification({
        status: 'normal',
        message: 'Checklist submitted successfully'
      });
      setResponses({});
    } catch (error) {
      setNotification({
        status: 'critical',
        message: 'Failed to submit checklist'
      });
    }
    setLoading(false);
  };

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
  };

  const totalItems = categories.reduce((total, category) =>
    total + category.ChecklistItems.length, 0);

  return (
    <Box gap="medium">
      {notification && (
        <Notification
          status={notification.status}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {toast && (
        <Toast
          status={toast.status}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Card background="dark-1">
        <CardHeader pad="medium">
          <Box direction="row" justify="between" align="center" fill>
            <Text weight="bold">Today's Checklist</Text>
            <Text>{new Date().toLocaleDateString()}</Text>
          </Box>
        </CardHeader>
      </Card>

      <Grid columns={{ count: 'fit', size: 'medium' }} gap="medium">
        {categories.map(category => (
          category.ChecklistItems.length > 0 && (
            <Card key={category.CategoryId} background="dark-1">
              <CardHeader pad="medium">
                <Box direction="row" justify="between" align="center" fill>
                  <Text weight="bold">{category.CategoryName}</Text>
                  <Text size="small">
                    {category.ChecklistItems.filter(item =>
                      responses[item.ItemId]?.done
                    ).length} / {category.ChecklistItems.length} completed
                  </Text>
                </Box>
              </CardHeader>
              <CardBody pad="medium">
                {category.ChecklistItems.map(item => (
                  <Box key={item.ItemId} gap="small" pad="small">
                    <Box direction="row" gap="small" align="center">
                      <Text>{item.Question}</Text>
                      {item.IsRequired && (
                        <Text color="status-critical" size="small">*Required</Text>
                      )}
                    </Box>
                    <Box gap="small">
                      <CheckBox
                        label="Completed"
                        checked={responses[item.ItemId]?.done || false}
                        onChange={e => setResponses(prev => ({
                          ...prev,
                          [item.ItemId]: {
                            ...prev[item.ItemId],
                            done: e.target.checked
                          }
                        }))}
                      />

                      <TextArea
                        placeholder="Add comment"
                        value={responses[item.ItemId]?.comment || ''}
                        onChange={e => setResponses(prev => ({
                          ...prev,
                          [item.ItemId]: {
                            ...prev[item.ItemId],
                            comment: e.target.value
                          }
                        }))}
                      />

                      {item.RequireImage && (
                        <Box direction="row" gap="small" align="center">
                          <FileInput
                            accept="image/*"
                            onChange={event => {
                              const file = event.target.files[0];
                              handleImageUpload(item.ItemId, file);
                            }}
                            messages={{
                              dropPrompt: 'Drop image here or click to upload'
                            }}
                          />
                          {responses[item.ItemId]?.image && (
                            <Image
                              src={responses[item.ItemId].image}
                              fit="cover"
                              width="50px"
                              height="50px"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </CardBody>
            </Card>
          )
        ))}
      </Grid>

      <Box direction="row" justify="between" margin={{ top: 'medium' }}>
        <Text>
          Total Progress: {
            Object.values(responses).filter(r => r.done).length
          } / {totalItems} items completed
        </Text>
        <Box direction="row" gap="small">
          <Button
            secondary
            color="status-critical"
            label="Reload"
            onClick={handleReload}
            disabled={loading}
          />
          <Button
            primary
            label="Submit Checklist"
            onClick={handleSubmit}
            disabled={loading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChecklistItems;