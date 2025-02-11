import React, { useContext, useState } from 'react';
import {
    Box,
    Form,
    FormField,
    TextInput,
    TextArea,
    Text,
    Heading,
    Card,
    CardBody,
    CardHeader,
    Button,
    Grid,
    RangeInput,
} from 'grommet';
import { Star, Send } from 'grommet-icons';
import { SessionContext, useMonitor } from '../../../context/session';
import { ConfirmOperation, CoverPage, LoadingLayer } from '../../../components';

const Feedback = () => {
    const { client } = useContext(SessionContext);
    const [formValues, setFormValues] = useState({
        comment: '',
        rating: 5,
    });
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useMonitor(
        client,
        ['/api/feedback'],
        ({ ['/api/feedback']: feedback }) => {
            if (feedback) {
                setFeedbacks(feedback);
                setLoading(false);
            }
        }
    );

    const FeedbackForm = () => (
        <Card elevation="small">
            <CardHeader pad="medium">
                <Heading level={3} margin="none">Submit Feedback</Heading>
                <Text color="dark-3">Share your thoughts about our product</Text>
            </CardHeader>
            <CardBody pad="medium">
                <Form value={formValues} onChange={setFormValues}>
                    <Box gap="medium">
                        <FormField
                            name="comment"
                            label="Your Feedback"
                            required
                        >
                            <TextArea
                                name="comment"
                                placeholder="Enter your feedback here..."
                                rows={4}
                            />
                        </FormField>

                        <FormField
                            name="rating"
                            label={
                                <Box direction="row" align="center" gap="small">
                                    <Text>Rating</Text>
                                    <Box direction="row" gap="xxsmall">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                color={star <= formValues.rating ? 'brand' : 'light-4'}
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            }
                        >
                            <RangeInput
                                name="rating"
                                min={1}
                                max={5}
                                step={1}
                            />
                        </FormField>

                        <Box align="end">
                            <Button
                                type="submit"
                                primary
                                color="status-critical"
                                icon={<Send />}
                                label="Submit Feedback"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowConfirm(true);
                                }}
                            />
                        </Box>
                    </Box>
                </Form>
            </CardBody>
        </Card>
    );

    const FeedbackList = () => (
        <Card elevation="small">
            <CardHeader pad="medium">
                <Heading level={3} margin="none">Recent Feedback</Heading>
            </CardHeader>
            <CardBody pad="medium">
                <Box gap="medium">

                    {feedbacks.map((feedback, index) => (
                        <Box
                            key={index}
                            pad="small"
                            round="small"
                            gap="small"
                            border={{
                                top: {
                                    size: 'xsmall',
                                    side: 'top'
                                }
                            }}
                        >
                            <Box direction="row" justify="between" align="center">
                                <Box direction="row" gap="xxsmall">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            color={star <= feedback.rating ? 'brand' : 'light-4'}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </Box>
                            <Text color="dark-3">{feedback.comment}</Text>
                            <Text size="small" color="dark-4">
                                {new Date(feedback.created_at).toLocaleString()}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </CardBody>
        </Card>
    );

    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <CoverPage title="Product Feedback">
            <Box pad="medium" fill>
                {loading && <LoadingLayer />}

                <Grid
                    columns={['1fr', '1fr']}
                    gap="medium"
                    fill
                >
                    <Box>
                        <FeedbackForm />
                    </Box>
                    <Box>
                        <FeedbackList />
                    </Box>
                </Grid>

                {showConfirm && (
                    <ConfirmOperation
                        title="Submit Feedback"
                        text="Are you sure you want to submit this feedback?"
                        onConfirm={() => client.post('/api/feedback', {
                            rating: formValues.rating,
                            comment: formValues.comment,
                        })}
                        onClose={() => setShowConfirm(false)}
                        yesPrompt="Submit"
                        noPrompt="Cancel"
                        estimatedTime={5}
                        onSuccess={() => {
                            setLoading(true);
                            setShowConfirm(false);
                            setFormValues({
                                comment: '',
                                rating: 5
                            });
                        }}
                    />
                )}
            </Box>
        </CoverPage>
    );
};

export default Feedback;
