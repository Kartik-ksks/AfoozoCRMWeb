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
import { ConfirmOperation, CoverPage, LoadingLayer, Tile, TileBox } from '../../../components';
import SiteFeedbackCard from './SiteFeedbackCard';

const WriteFeedback = ({ title, FeedbackUri }) => {
    const { client } = useContext(SessionContext);
    const [formValues, setFormValues] = useState({
        comment: '',
        rating: 5,
    });

    const FeedbackForm = () => (
        <Box>
            <Box pad="medium">
                <Form value={formValues} onChange={setFormValues}>
                    <Box gap="medium" >
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
            </Box>
        </Box>
    );

    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <Box pad="medium" fill>
            <TileBox
                title={title}
            >
                <Tile title="Site Feedback" subTitle="Select a site to give feedback"s>
                    <SiteFeedbackCard />
                </Tile>
                {/* <Tile
                    title="Feedback Form"
                    subTitle="Share your thoughts about our product"
                >
                    <FeedbackForm />
                </Tile> */}
            </TileBox>

            {showConfirm && (
                <ConfirmOperation
                    title="Submit Feedback"
                    text="Are you sure you want to submit this feedback?"
                    onConfirm={() => {
                        return client.post(FeedbackUri, {
                            rating: formValues.rating,
                            comment: formValues.comment,
                        })
                    }}
                    onClose={() => setShowConfirm(false)}
                    yesPrompt="Submit"
                    noPrompt="Cancel"
                    estimatedTime={5}
                    onSuccess={() => {
                        setShowConfirm(false);
                        setFormValues({
                            comment: '',
                            rating: 5
                        });
                    }}
                    progressLabel={`Submitting feedback...`}
                />
            )}
        </Box>
    );
};

export default WriteFeedback;
