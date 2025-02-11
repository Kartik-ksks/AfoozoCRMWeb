import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Paragraph } from 'grommet';

import { OperationBar } from './OperationBar';
import QLayer from './QLayer';

const ConfirmOperation = ({
    title,
    text,
    onConfirm,
    onClose,
    estimatedTime,
    progressLabel,
    onSuccess,
    yesPrompt,
    noPrompt,
    closeDuring,
}) => {
    const [waiting, setWaiting] = useState();
    const [promise, setPromise] = useState();

    return (
        <QLayer
            title={title}
            onClose={onClose}
            displayInfo={false}
            disableClose={!(promise && closeDuring)}
        >
            {typeof text === 'string' ? (
                <Paragraph margin="None">{text}</Paragraph>
            ) : (
                text
            )}
            <Box direction="row-responsive" justify="end" pad={{ bottom: 'small', top: 'medium' }}>
                <Button label={noPrompt}  color="status-critical" disabled={waiting} onClick={onClose} />
                <Button
                    primary
                    color="status-critical"
                    label={yesPrompt}
                    disabled={waiting}
                    onClick={() => {
                        setWaiting(true);
                        setPromise(onConfirm());
                    }}
                />
            </Box>
            {promise && (
                <OperationBar
                    name={progressLabel}
                    estimatedTime={estimatedTime}
                    promise={promise}
                    onComplete={() => setWaiting(false)}
                    onSuccess={onSuccess || onClose}
                />
            )}
        </QLayer>
    );
};

ConfirmOperation.propTypes = {
    title: PropTypes.string,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    onClose: PropTypes.func.isRequired,
    // Must return a redfish promise
    onConfirm: PropTypes.func.isRequired,
    estimatedTime: PropTypes.number.isRequired,
    progressLabel: PropTypes.string,
    // On success, onClose will be called. That can be overidden with this.
    onSuccess: PropTypes.func,
    yesPrompt: PropTypes.string,
    noPrompt: PropTypes.string,
    closeDuring: PropTypes.bool,
};

ConfirmOperation.defaultProps = {
    title: '',
    progressLabel: 'Submitting...',
    onSuccess: null,
    yesPrompt: 'Yes',
    noPrompt: 'No',
    closeDuring: true,
};

export default ConfirmOperation;
