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
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                color={star <= (value || 0) ? 'status-warning' : 'light-4'}
                                onClick={() => onChange(star)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>
                    <Text size="small" color="dark-6">
                        {value === 1
                            ? 'Poor'
                            : value === 2
                                ? 'Fair'
                                : value === 3
                                    ? 'Good'
                                    : value === 4
                                        ? 'Very Good'
                                        : value === 5
                                            ? 'Excellent'
                                            : 'Select Rating'}
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
                response.forEach((site) => {
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
            const response = await client.get(
                `/api/questions-scan/filter?siteId=${siteId}`
            );
            if (response) {
                setQuestions(response);
                setFormData((prev) => ({
                    ...prev,
                    questions: response.map((q) => ({
                        questionId: q.QuestionId,
                        answer: q.QuestionType === 'rating' ? 5 : '',
                        comment: '',
                    })),
                }));
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSatisfactionChange = (value) => {
        setSatisfied(value);
        const defaultAnswer =
            value === 3 || value === 5 ? value : value === 1 ? 1 : '';
        setFormData((prev) => ({
            ...prev,
            questions: questions.map((q) => ({
                questionId: q.QuestionId,
                answer: q.QuestionType === 'rating' ? defaultAnswer : '',
                comment: '',
            })),
        }));
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
            errors.satisfied = 'Please indicate your satisfaction level';
        }

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setStatus('');
            return;
        }

        try {
            const transformedQuestions =
                satisfied === 1
                    ? formData.questions
                        .filter((q) => q.answer !== '' && q.answer !== null)
                        .map((q) => ({
                            questionId: q.questionId,
                            answer: q.answer.toString(),
                        }))
                    : [];

            const payload = {
                username: formData.username,
                email: formData.email,
                siteIds: [parseInt(siteId)],
                questions: transformedQuestions,
                comment: formData.comment || '',
                rating: satisfied,
            };

            await client.post('/api/question-feedback-scan', payload);
            setStatus('success');
            setFormData({
                username: '',
                email: '',
                questions: questions.map((q) => ({
                    questionId: q.QuestionId,
                    answer: q.QuestionType === 'rating' ? 5 : '',
                    comment: '',
                })),
                comment: '',
            });
            setSatisfied(null);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setStatus('error');
        }
    };

    if (loading) return <LoadingLayer />;

    return (
        <Box
            fill
            overflow="hidden"
            style={{ height: '100vh' }}
            background="light-2"
        >
            <Card
                background="light-1"
                elevation="small"
                width="100%"
                height="100%"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <CardHeader pad="medium" background="dark-2">
                    <Box>
                        <Heading level={2} margin="none">
                            Feedback Form
                        </Heading>
                        {siteName && (
                            <Text size="large" weight="bold" margin={{ top: 'small' }}>
                                Site: {siteName}
                            </Text>
                        )}
                    </Box>
                </CardHeader>

                <CardBody
                    pad="medium"
                    overflow={{ vertical: 'auto' }}
                    flex="grow"
                    style={{ overflowY: 'auto' }}
                >
                    <Form onSubmit={handleSubmit}>
                        <Box gap="medium">
                            <FormField label="Name" error={errors.username}>
                                <TextInput
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            username: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter your name"
                                />
                            </FormField>

                            <FormField label="Email" error={errors.email}>
                                <TextInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter your email"
                                />
                            </FormField>

                            <FormField
                                label="How satisfied are you with our service?"
                                error={errors.satisfied}
                            >
                                <Box
                                    direction="row"
                                    gap="medium"
                                    justify="center"
                                    wrap
                                    margin={{ top: 'small' }}
                                >
                                    {[1, 3, 5].map((level) => (
                                        <Button
                                            key={level}
                                            plain
                                            onClick={() => handleSatisfactionChange(level)}
                                            focusIndicator={false}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '8px',
                                                background:
                                                    satisfied === level
                                                        ? level === 1
                                                            ? 'rgba(255, 0, 0, 0.1)'
                                                            : level === 3
                                                                ? 'rgba(255, 193, 7, 0.1)'
                                                                : 'rgba(0, 128, 0, 0.1)'
                                                        : 'white',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <Text size="xlarge">
                                                {level === 1 ? '☹️' : level === 3 ? '😊' : '😄'}
                                            </Text>
                                            <Text
                                                color={
                                                    satisfied === level
                                                        ? level === 1
                                                            ? 'status-critical'
                                                            : level === 3
                                                                ? 'status-warning'
                                                                : 'status-ok'
                                                        : 'dark-6'
                                                }
                                            >
                                                {level === 1
                                                    ? 'Not Satisfied'
                                                    : level === 3
                                                        ? 'Satisfied'
                                                        : 'Excellent'}
                                            </Text>
                                        </Button>
                                    ))}
                                </Box>
                            </FormField>


                            {questions.map((question, index) => (
                                <Card
                                    key={question.QuestionId}
                                    background="light-2"
                                    pad="medium"
                                >
                                    <FormField label={question.QuestionText}>
                                        <QuestionTypeComponent
                                            question={question}
                                            value={formData.questions[index]?.answer}
                                            onChange={(value) => {
                                                const newQuestions = [...formData.questions];
                                                newQuestions[index] = {
                                                    ...newQuestions[index],
                                                    answer: value,
                                                };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    questions: newQuestions,
                                                }));
                                            }}
                                        />
                                    </FormField>
                                </Card>
                            ))}

                            <FormField label="Additional Comments">
                                <TextArea
                                    value={formData.comment}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            comment: e.target.value,
                                        }))
                                    }
                                    placeholder="Please share your overall experience..."
                                />
                            </FormField>

                            <Box margin={{ top: 'medium' }} align="center">
                                <Button
                                    type="submit"
                                    primary
                                    color="brand"
                                    label={
                                        status === 'sending' ? 'Submitting...' : 'Submit Feedback'
                                    }
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
