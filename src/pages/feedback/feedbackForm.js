import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Form,
    FormField,
    Heading,
    TextArea,
    TextInput,
    Notification,
    Text,
    Card,
    CardBody,
    CardHeader,
    RadioButtonGroup,
} from 'grommet';
import { Star } from 'grommet-icons';
import { SessionContext } from '../../context/session';
import { LoadingLayer } from '../../components';
import { validateEmail, validateName } from '../../Utils';

const QuestionTypeComponent = ({ question, value, onChange }) => {
    switch (question.QuestionType.toLowerCase()) {
        case 'rating':
            return (
                <Box gap="small">
                    <Box direction="row" align="center" gap="small">
                        <Box direction="row" align="center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    color={star <= (value || 0) ? 'status-warning' : 'light-4'}
                                    onClick={() => onChange(star)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Text size="small" color="dark-6">
                        {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : value === 5 ? 'Excellent' : 'Select Rating'}
                    </Text>
                </Box>
            );
        case 'boolean':
            return (
                <RadioButtonGroup
                    name={`question-${question.QuestionId}`}
                    options={['Yes', 'No']}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case 'text':
            return (
                <TextArea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type your answer here..."
                />
            );
        default:
            return null;
    }
};

const FeedbackForm = () => {
    const { siteId } = useParams();
    const { client } = useContext(SessionContext);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState({});
    const [siteName, setSiteName] = useState('');
    const [satisfied, setSatisfied] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        questions: [],
        comment: '',
    });

    useEffect(() => {
        if (siteId) {
            fetchSiteDetails();
            fetchQuestions();
        }
    }, [siteId]);

    const fetchSiteDetails = async () => {
        try {
            const response = await client.get(`/api/sites-scan`);
            if (response) {
                response.forEach(site => {
                    if (site.SiteId === parseInt(siteId)) {
                        setSiteName(site.SiteName);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching site details:', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await client.get(`/api/questions-scan/filter?siteId=${siteId}`);
            if (response) {
                setQuestions(response);
                // Initialize questions array with empty answers
                setFormData(prev => ({
                    ...prev,
                    questions: response.map(q => ({
                        questionId: q.QuestionId,
                        answer: q.QuestionType === 'rating' ? 5 : '',
                        comment: ''
                    }))
                }));
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSatisfactionChange = (value) => {
        setSatisfied(value === 'Yes');
        if (value === 'Yes') {
            // Pre-fill all questions with 5-star ratings
            setFormData(prev => ({
                ...prev,
                questions: questions.map(q => ({
                    questionId: q.QuestionId,
                    answer: 5,
                    comment: ''
                }))
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('sending');
        const errors = {};

        if (!validateName(formData.username)) {
            errors.username = 'Please enter a valid name';
        }
        if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email';
        }
        if (satisfied === null) {
            errors.satisfied = 'Please indicate if you are satisfied';
        }

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setStatus('');
            return;
        }

        try {
            // Transform questions array to match required format
            const transformedQuestions = formData.questions
                .filter(q => q.answer) // Only include questions with answers
                .map(q => ({
                    questionId: q.questionId,
                    answer: satisfied ? "5" : q.answer.toString() // Ensure answer is a string
                }));

            const payload = {
                username: formData.username,
                email: formData.email,
                siteIds: [parseInt(siteId)], // Convert siteId to number and wrap in array
                questions: transformedQuestions, // Empty array if satisfied
                comment: formData.comment || '',
                rating: satisfied ? 5 : Math.min(...formData.questions.map(q => q.answer || 5)) // Use 5 if satisfied, else minimum rating
            };

            await client.post('/api/question-feedback-scan', payload);
            setStatus('success');
            // Reset form
            setFormData({
                username: '',
                email: '',
                questions: questions.map(q => ({
                    questionId: q.QuestionId,
                    answer: q.QuestionType === 'rating' ? 5 : '',
                    comment: ''
                })),
                comment: '',
            });
            setSatisfied(null);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setStatus('error');
        }
    };

    if (loading) {
        return <LoadingLayer />;
    }

    return (
        <Box fill align="center" pad="medium" overflow="auto">
            <Card background="light-1" elevation="small" width="large">
                <CardHeader pad="medium" background="dark-2">
                    <Box>
                        <Heading level={2} margin="none">Feedback Form</Heading>
                        {siteName && (
                            <Text size="large" weight="bold" margin={{ top: 'small' }}>
                                Site: {siteName}
                            </Text>
                        )}
                    </Box>
                </CardHeader>

                <CardBody pad="medium" overflow="auto">
                    <Form onSubmit={handleSubmit}>
                        <Box gap="medium" overflow="auto">
                            <FormField label="Name" error={errors.username}>
                                <TextInput
                                    value={formData.username}
                                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="Enter your name"
                                />
                            </FormField>

                            <FormField label="Email" error={errors.email}>
                                <TextInput
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter your email"
                                />
                            </FormField>

                            <FormField label="Are you satisfied with our service?" error={errors.satisfied}>
                                <RadioButtonGroup
                                    name="satisfied"
                                    options={['Yes', 'No']}
                                    value={satisfied === null ? '' : satisfied ? 'Yes' : 'No'}
                                    onChange={(e) => handleSatisfactionChange(e.target.value)}
                                />
                            </FormField>

                            {satisfied === false && questions.map((question, index) => (
                                <Card key={question.QuestionId} background="light-2" pad="medium">
                                    <FormField label={question.QuestionText}>
                                        <QuestionTypeComponent
                                            question={question}
                                            value={formData.questions[index]?.answer}
                                            onChange={(value) => {
                                                const newQuestions = [...formData.questions];
                                                newQuestions[index] = {
                                                    ...newQuestions[index],
                                                    answer: value
                                                };
                                                setFormData(prev => ({ ...prev, questions: newQuestions }));
                                            }}
                                        />
                                    </FormField>
                                </Card>
                            ))}

                            <FormField label="Additional Comments">
                                <TextArea
                                    value={formData.comment}
                                    onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Please share your overall experience..."
                                />
                            </FormField>

                            <Box margin={{ top: 'medium' }} align="center">
                                <Button
                                    type="submit"
                                    primary
                                    color="brand"
                                    label={status === 'sending' ? 'Submitting...' : 'Submit Feedback'}
                                    disabled={status === 'sending'}
                                />
                            </Box>
                        </Box>
                    </Form>

                    {status === 'success' && (
                        <Notification
                            status="normal"
                            message="Thank you for your feedback!"
                            onClose={() => setStatus('')}
                        />
                    )}
                    {status === 'error' && (
                        <Notification
                            status="critical"
                            message="Error submitting feedback. Please try again."
                            onClose={() => setStatus('')}
                        />
                    )}
                </CardBody>
            </Card>
        </Box>
    );
};

export default FeedbackForm;