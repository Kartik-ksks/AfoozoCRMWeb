import React from 'react';
import { Box, Heading, Markdown, Paragraph, Text } from 'grommet';
import { useParams } from 'react-router-dom';
import { CoverPage, RoutedTabs } from '../../../components';
import WriteFeedback from './WriteFeedback';
import ViewFeedback from './ViewFeedback';


const FeedbackUri = '/api/feedback';
const Feedback = () => {
    const { feedbackType } = useParams();

    const renderDefaultTab = () => (
        <Box align="center" pad="small" gap="small">
            <Heading level="2">Overview of Feedback</Heading>
            <Paragraph margin={{ top: 'none', bottom: 'none' }}>
                Manage feedback from the tabs above.
            </Paragraph>
        </Box>
    );

    const renderTabTitle = (text) => (
        <Box direction="row" gap="xsmall">
            <Text>{text}</Text>
        </Box>
    );

    return (
        <CoverPage title="Feedback">
            <RoutedTabs
                path="/feedback"
                selected={feedbackType || ''}
                items={[
                    {
                        key: '',
                        title: renderTabTitle('Overview'),
                        children: renderDefaultTab(),
                    },
                    // {
                    //     key: 'write-feedback',
                    //     title: renderTabTitle('Give Feedback'),
                    //     children: (
                    //         <WriteFeedback
                    //             title='Give Feedback'
                    //             FeedbackUri={FeedbackUri}
                    //         />
                    //     ),
                    // },
                    {
                        key: 'view-feedback',
                        title: renderTabTitle('View Feedback'),
                        children: (
                            <ViewFeedback
                                title='View Feedback'
                                uri={FeedbackUri} />
                        )
                    },
                ]}
            />
        </CoverPage>
    );
};

export default Feedback;
