import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  TextArea,
  Button,
  FileInput,
  Image,
  Grid,
  Notification,
} from 'grommet';
import { Upload, StatusGood, Like as ThumbsUp, Dislike as ThumbsDown } from 'grommet-icons';
import { SessionContext } from '../../../context/session';
import Toast from '../../../components/Toast';
import axios from 'axios';

const ChecklistItems = ({ categories, siteId, selectedCategory, checklist }) => {
  const { client } = useContext(SessionContext);
  const [responses, setResponses] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleImageUpload = (itemId, file) => {
    try {
      // Store the file object
      setImageFiles(prev => ({
        ...prev,
        [itemId]: file
      }));

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => ({
        ...prev,
        [itemId]: previewUrl
      }));

      // Update responses to indicate an image is attached
      setResponses(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          hasImage: true
        }
      }));
    } catch (error) {
      console.error('Image upload error:', error);
      setNotification({
        status: 'critical',
        message: 'Failed to process image: ' + (error.message || 'Unknown error')
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

        if (item.RequireImage && !imageFiles[item.ItemId]) {
          missingRequired.push({
            category: category.CategoryName,
            question: `${item.Question} (image required)`
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

  // In your React component, modify the handleSubmit function:
  const handleSubmit = async () => {
    // if (!validateResponses()) {
    //   return;
    // }

    setLoading(true);
    try {
      const formData = new FormData();

      // Prepare responses data
      const responsesData = Object.entries(responses)
        .filter(([_, response]) => response.done !== undefined)
        .map(([itemId, response]) => ({
          itemId: parseInt(itemId, 10),
          done: Boolean(response.done),
          comment: response.comment || ''
        }));

      formData.append('responses', JSON.stringify(responsesData));

      // CHANGE HERE: Use 'images' as the field name for all files
      // and include the itemId as metadata in the responses
      Object.keys(imageFiles).forEach((itemId, index) => {
        if (imageFiles[itemId]) {
          formData.append('images', imageFiles[itemId]);
          // Update the corresponding response with the index of this file
          responsesData[responsesData.findIndex(r => r.itemId === parseInt(itemId, 10))].imageIndex = index;
        }
      });

      // Re-append the updated responsesData
      formData.set('responses', JSON.stringify(responsesData));

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/checklist/submit`, formData, {
        headers: {
          'Authorization': `Bearer ${client.session?.token || ''}`
        }
      });

      setNotification({
        status: 'normal',
        message: 'Checklist submitted successfully'
      });

      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to submit checklist';

      setNotification({
        status: 'critical',
        message: errorMessage
      });
    }
    setLoading(false);
  };

  const resetForm = () => {
    // Initialize empty responses for all items
    const initialResponses = {};

    // Use filteredChecklist instead of categories since that's what we're displaying
    if (Array.isArray(filteredChecklist)) {
      filteredChecklist.forEach(category => {
        if (Array.isArray(category.ChecklistItems)) {
          category.ChecklistItems.forEach(item => {
            initialResponses[item.ItemId] = {
              done: false,
              comment: ''
            };
          });
        }
      });
    }

    // Clean up object URLs with safety check
    if (imagePreviews && typeof imagePreviews === 'object') {
      Object.values(imagePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    }

    setResponses(initialResponses);
    setImageFiles({});
    setImagePreviews({});
  };

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
    // Add actual reload logic here if needed
    setLoading(false);
  };

  // Filter the checklist to only show the selected category
  const filteredChecklist = React.useMemo(() => {
    if (!checklist || !selectedCategory) return [];

    return checklist.filter(category =>
      category.CategoryId.toString() === selectedCategory
    );
  }, [checklist, selectedCategory]);

  // Safe calculation for total items
  const totalItems = React.useMemo(() => {
    if (!filteredChecklist || !filteredChecklist.length) return 0;

    return filteredChecklist.reduce((total, category) =>
      total + (category.ChecklistItems?.length || 0), 0
    );
  }, [filteredChecklist]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

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
            <Text weight="bold">Today's Checklist - {new Date().toLocaleDateString()}</Text>
          </Box>
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
              color="status-critical"
              label="Submit Checklist"
              onClick={handleSubmit}
              disabled={loading}
            />
          </Box>
        </CardHeader>
      </Card>

      <Grid columns={{ count: 'fit', size: 'medium' }} gap="medium">
        {filteredChecklist.map(category => (
          (category.ChecklistItems?.length > 0) && (
            <Card key={category.CategoryId} background="dark-1">
              <CardHeader pad="medium">
                <Box direction="row" justify="between" align="center" fill>
                  <Text weight="bold">{category.CategoryName}</Text>
                  <Text size="small">
                    {(category.ChecklistItems || []).filter(item =>
                      responses[item.ItemId]?.done
                    ).length} / {category.ChecklistItems?.length || 0} completed
                  </Text>
                </Box>
              </CardHeader>
              <CardBody pad="medium">
                {(category.ChecklistItems || []).map(item => (
                  <Box key={item.ItemId} gap="small" pad="small" border={{ side: 'bottom', color: 'dark-3' }} margin={{ bottom: 'small' }}>
                    <Box direction="row" gap="small" align="center">
                      <Text>{item.Question}</Text>
                      {item.IsRequired && (
                        <Text color="status-critical" size="small">*Required</Text>
                      )}
                      {item.RequireImage && (
                        <Text color="accent-1" size="small">*Image required</Text>
                      )}
                    </Box>
                    <Box gap="small">
                      <Box direction="row" gap="medium" align="center">
                        <Box
                          direction="row"
                          align="center"
                          gap="small"
                          onClick={() => setResponses(prev => ({
                            ...prev,
                            [item.ItemId]: {
                              ...prev[item.ItemId],
                              done: true
                            }
                          }))}
                          style={{ cursor: 'pointer' }}
                        >
                          <ThumbsUp
                            color={responses[item.ItemId]?.done === true ? "status-ok" : "light-5"}
                            size="medium"
                          />
                          <Text size="small" color={responses[item.ItemId]?.done === true ? "status-ok" : "light-5"}>
                            Completed
                          </Text>
                        </Box>

                        <Box
                          direction="row"
                          align="center"
                          gap="small"
                          onClick={() => setResponses(prev => ({
                            ...prev,
                            [item.ItemId]: {
                              ...prev[item.ItemId],
                              done: false
                            }
                          }))}
                          style={{ cursor: 'pointer' }}
                        >
                          <ThumbsDown
                            color={responses[item.ItemId]?.done === false ? "status-critical" : "light-5"}
                            size="medium"
                          />
                          <Text size="small" color={responses[item.ItemId]?.done === false ? "status-critical" : "light-5"}>
                            Not Completed
                          </Text>
                        </Box>
                      </Box>

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

                      {/* Image Upload Section - Show for all items, but mark as required when needed */}
                      <Box gap="small">
                        <Box direction="row" align="center" gap="small">
                          <Upload size="small" />
                          <Text size="small">Upload Image</Text>
                          {item.RequireImage && (
                            <Text color="accent-1" size="xsmall">*required</Text>
                          )}
                        </Box>

                        <FileInput
                          accept="image/*"
                          onChange={event => {
                            const file = event.target.files?.[0];
                            if (file) {
                              handleImageUpload(item.ItemId, file);
                            }
                          }}
                          messages={{
                            dropPrompt: 'Drop image here',
                            browse: 'Select Image'
                          }}
                        />

                        {imagePreviews[item.ItemId] && (
                          <Box height="small" width="small" margin={{ top: 'small' }}>
                            <Image
                              src={imagePreviews[item.ItemId]}
                              fit="contain"
                            />
                            <Button
                              size="small"
                              label="Remove"
                              onClick={() => {
                                // Remove image preview
                                URL.revokeObjectURL(imagePreviews[item.ItemId]);
                                setImagePreviews(prev => {
                                  const updated = { ...prev };
                                  delete updated[item.ItemId];
                                  return updated;
                                });

                                // Remove file
                                setImageFiles(prev => {
                                  const updated = { ...prev };
                                  delete updated[item.ItemId];
                                  return updated;
                                });

                                // Update response
                                setResponses(prev => ({
                                  ...prev,
                                  [item.ItemId]: {
                                    ...prev[item.ItemId],
                                    hasImage: false
                                  }
                                }));
                              }}
                              margin={{ top: 'xsmall' }}
                            />
                          </Box>
                        )}
                      </Box>
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
      </Box>
    </Box>
  );
};

export default ChecklistItems;