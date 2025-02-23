import React, { useContext, useState } from 'react';
import { Box, Heading, Card, CardHeader, CardBody, Text } from 'grommet';
import { Star } from 'grommet-icons';
import { Tile, TileBox, CoverPage } from '../../../components';
import { SessionContext, useMonitor } from '../../../context/session';


const FeedbackView = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { client } = useContext(SessionContext);


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

  const renderFeedback = () => (
    <Card elevation="small">
      <CardHeader pad="medium">
        <Heading level={3} margin="none">Recent Feedback</Heading>
      </CardHeader>
      <CardBody pad="medium">
        <Box gap="medium">

          {feedbacks.map((feedback, index) => (
            <>
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
                  <Text>User: {feedback.Creator.Username}</Text>
                  <Text weight="bold">{feedback.subject}</Text>
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
            </>
          ))}
        </Box>
      </CardBody>
    </Card>
  );

  return (
    <CoverPage title="Feedback" >
      {renderFeedback()}
    </CoverPage>

  );

};

export default FeedbackView;