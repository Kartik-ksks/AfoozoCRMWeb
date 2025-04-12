import React, { useState } from 'react';
import {
    Box,
    Layer,
    Heading,
    Form,
    FormField,
    TextArea,
    Button,
    Text,
    RangeInput,
} from 'grommet';
import { Star } from 'grommet-icons';
import { ConfirmOperation } from '../../../components';

const QuestionLayer = ({ questions, onClose, onSubmit }) => {
    const [formValues, setFormValues] = useState({
        questions: questions.map(q => ({
            questionId: q.QuestionId,
            answer: q.QuestionType === 'rating' ? 5 : ''
        })),
        comment: '',
        rating: 5
    });
    const [showConfirm, setShowConfirm] = useState(false);

    const renderQuestionInput = (question, index) => {
        switch (question.QuestionType) {
            case 'rating':
                return (
                    <Box gap="small">
                        <Box direction="row" align="center" gap="small">
                            <Text>Rating</Text>
                            <Box direction="row" gap="xxsmall">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        color={star <= formValues.questions[index].answer ? 'brand' : 'light-4'}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                        <RangeInput
                            min={1}
                            max={5}
                            step={1}
                            value={formValues.questions[index].answer}
                            onChange={e => {
                                const newQuestions = [...formValues.questions];
                                newQuestions[index].answer = parseInt(e.target.value, 10);
                                setFormValues({ ...formValues, questions: newQuestions });
                            }}
                        />
                    </Box>
                );
            case 'text':
                return (
                    <TextArea
                        value={formValues.questions[index].answer}
                        onChange={e => {
                            const newQuestions = [...formValues.questions];
                            newQuestions[index].answer = e.target.value;
                            setFormValues({ ...formValues, questions: newQuestions });
                        }}
                    />
                );
            case 'boolean':
                return (
                    <Box direction="row" gap="medium">
                        <Button
                            label="Yes"
                            primary={formValues.questions[index].answer === 'yes'}
                            onClick={() => {
                                const newQuestions = [...formValues.questions];
                                newQuestions[index].answer = 'yes';
                                setFormValues({ ...formValues, questions: newQuestions });
                            }}
                        />
                        <Button
                            label="No"
                            primary={formValues.questions[index].answer === 'no'}
                            onClick={() => {
                                const newQuestions = [...formValues.questions];
                                newQuestions[index].answer = 'no';
                                setFormValues({ ...formValues, questions: newQuestions });
                            }}
                        />
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Layer
            onEsc={onClose}
            onClickOutside={onClose}
        >
            <Box pad="medium" gap="medium" width="large">
                <Heading level={3} margin="none">
                    Feedback Questions
                </Heading>

                <Form value={formValues} onChange={setFormValues}>
                    <Box gap="medium">
                        {questions.map((question, index) => (
                            <FormField
                                key={question.QuestionId}
                                name={`question-${question.QuestionId}`}
                                label={question.QuestionText}
                                required
                            >
                                {renderQuestionInput(question, index)}
                            </FormField>
                        ))}
                    </Box>
                    <Box direction="row" gap="small">
                        <FormField
                            name="comment"
                            label="Your Feedback"
                            required
                        >
                            <TextArea
                                name="comment"
                                placeholder="Enter your feedback here..."
                                rows={4}
                                fill
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
                    </Box>
                </Form>

                <Box direction="row" justify="end" gap="small">
                    <Button
                        label="Cancel"
                        onClick={onClose}
                    />
                    <Button
                        primary
                        color="brand"
                        label="Submit"
                        onClick={() => setShowConfirm(true)}
                    />
                </Box>
            </Box>

            {showConfirm && (
                <ConfirmOperation
                    title="Submit Feedback"
                    text="Are you sure you want to submit your feedback?"
                    onConfirm={() => onSubmit(formValues)}
                    onClose={() => setShowConfirm(false)}
                    yesPrompt="Submit"
                    noPrompt="Cancel"
                    estimatedTime={5}
                    progressLabel={`Submitting feedback...`}
                />
            )}
        </Layer>
    );
};

export default QuestionLayer;