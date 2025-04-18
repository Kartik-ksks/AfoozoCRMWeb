import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
  } from 'react';
  import PropTypes from 'prop-types';
  import { Box, Meter, Text } from 'grommet';
  import { StatusGood, StatusWarning, StatusCritical } from 'grommet-icons';

  import { SessionContext } from '../context/session';
  import { useIsMounted, usePrevious, UseMonitorResponseMessage } from '../Utils';

  export const OperationBar = ({
    taskMonitor, // for monitoring an in-progress task
    initCompleted, // for a task already in progress, how much is completed
    promise,
    name, // Text to display above the progress meter.
    estimatedTime, // Estimated time, in seconds, to complete task.
    fill, // Box fill property for the UI
    onComplete, // Function. On completion, whether due to success or failure.
    onSuccess, // Function. On completion only on success.
    monitorToMessages, // Function. Convert task monitor to strings.
  }) => {
    const { client } = useContext(SessionContext);

    const [completed, setCompleted] = useState(initCompleted);
    const [status, setStatus] = useState('ok');
    const [messages, setMessages] = useState([]);
    const [icon, setIcon] = useState(null);

    const promisesRef = useRef(
      // eslint-disable-next-line no-nested-ternary
      promise ? (Array.isArray(promise) ? promise : [promise]) : null,
    );
    const meterAutoFillTimerRef = useRef(null);
    const waitForTaskTimerRef = useRef(null);

    // Track intermittent failures to poll status
    const consecutivePollFailsRef = useRef(0);

    const isMountedRef = useIsMounted();

    const prevPromise = usePrevious(promise);

    // We'll fill up the meter to a max of 90% while waiting.
    const meterMaxAutoFill = 90;
    const meterDelaySecsPerTick = estimatedTime / meterMaxAutoFill;
    const MAX_CONSECUTIVE_POLL_FAILS = 5;

    useEffect(() => {
      return () => {
        // cleanup timers on unmount
        clearTimeout(waitForTaskTimerRef.current);
        clearTimeout(meterAutoFillTimerRef.current);
      };
    }, []);

    useEffect(() => {
      // Start auto-filling the progress meter.
      meterAutoFillTimerRef.current = setInterval(() => {
        if (isMountedRef.current) setCompleted((val) => val + 1);
      }, meterDelaySecsPerTick * 1000);

      return () => {
        if (meterAutoFillTimerRef.current) {
          clearInterval(meterAutoFillTimerRef.current);
          meterAutoFillTimerRef.current = null;
        }
      };
    }, [isMountedRef, meterDelaySecsPerTick]);

    useEffect(() => {
      if (completed >= meterMaxAutoFill && meterAutoFillTimerRef.current) {
        // Task is complete, cancel interval timer
        clearInterval(meterAutoFillTimerRef.current);
        meterAutoFillTimerRef.current = null;
      }
      if (completed >= 100) {
        onComplete();
        if (status === 'ok') {
          onSuccess();
        }
      }
    }, [completed, status]);

    // Move respToText definition before it's used
    const respToText = useCallback(
      (res) => {
        if (!isMountedRef.current) return;

        const result = monitorToMessages(res);
        if (Array.isArray(result)) {
          setMessages(result);
        } else {
          result.then((text) => {
            setMessages(text);
          });
        }
      },
      [isMountedRef, monitorToMessages]
    );

    const complete = useCallback(
      (sts, msgs = null) => {
        if (!isMountedRef.current) return;

        setStatus(sts);
        setMessages(msgs);
        setCompleted(100);

        if (sts === 'ok' && onSuccess) {
          onSuccess();
        }
        if (onComplete) {
          onComplete();
        }
      },
      [isMountedRef, onComplete, onSuccess]
    );

    const handleResponse = async (response) => {
      try {
        if (!response.ok) {
          const errorData = await response.json();
          setStatus('critical');
          setMessages([{
            health: 'critical',
            msg: errorData.message || 'An error occurred'
          }]);
          setCompleted(100);
          return false;
        }
        return true;
      } catch (error) {
        setStatus('critical');
        setMessages([{
          health: 'critical',
          msg: error.message || 'An error occurred'
        }]);
        setCompleted(100);
        return false;
      }
    };

    const waitForTask = useCallback(
      (monitorUri) => {
        if (!isMountedRef.current) return;

        waitForTaskTimerRef.current = null;
        client
          .rawGet(monitorUri)
          .then((res) => {
            consecutivePollFailsRef.current = 0;
            if (res.ok) {
              if (res.status === 202) {
                waitForTaskTimerRef.current = setTimeout(
                  () => waitForTask(monitorUri),
                  5000,
                );
              } else {
                complete('ok');
              }
            } else {
              complete('critical');
            }
            respToText(res);
          })
          .catch((err) => {
            console.error(err);
            consecutivePollFailsRef.current += 1;
            if (consecutivePollFailsRef.current < MAX_CONSECUTIVE_POLL_FAILS) {
              waitForTaskTimerRef.current = setTimeout(
                () => waitForTask(monitorUri),
                5000,
              );
            } else {
              complete('critical', [
                {
                  health: 'critical',
                  msg: 'Connection lost. Status of request is unknown.',
                },
              ]);
            }
          });
      },
      [complete, respToText, client]
    );

    const handlePromises = useCallback(async () => {
      if (!promisesRef.current) return;

      try {
        const results = await Promise.all(promisesRef.current);
        const hasError = results.some(res => !res.ok);

        if (hasError) {
          const errorResponse = results.find(res => !res.ok);
          const success = await handleResponse(errorResponse);
          if (!success) return;
        }

        complete('ok');
      } catch (error) {
        console.error('Operation failed:', error);
        complete('critical', [{
          health: 'critical',
          msg: error.message || 'Operation failed'
        }]);
      }
    }, [complete]);

    useEffect(() => {
      if (promise && promise !== prevPromise) {
        handlePromises();
      }
    }, [promise, prevPromise, handlePromises]);

    const monitorPromise = useCallback(() => {
      setStatus('ok');
      setMessages([]);

      const promises = promisesRef.current;
      let promisesInProgress = promises ? promises.length : 0;
      let fails = 0;
      const monitorUris = [];

      if (taskMonitor) waitForTask(taskMonitor);

      // Wait for client promises to complete.
      if (promises) {
        promises.forEach((prom) => {
          prom
            .then((res) => {
              promisesInProgress -= 1;
              if (!res || res.ok) {
                if (res?.status === 202) {
                  // A Task has been created to track the status/progress.
                  monitorUris.push(res.headers.get('Location'));
                } else if (!fails && !promisesInProgress && !monitorUris.length) {
                  // This operation was successful!
                  // And no other operations or tasks to wait on! All done!
                  complete('ok');
                }
                if (!fails && !promisesInProgress && monitorUris.length > 0) {
                  // All operations have returned, but we have tasks to poll.
                  if (monitorUris.length > 1) {
                    // There exists a very lazy developer who, when updating this
                    // component to handle multiple operations, noticed that we
                    // did not have a case of needing to support more than 1
                    // operation becoming a task, so did not update waitForTask to
                    // handle that.
                    throw new Error('Multiple tasks: not implemented');
                  } else {
                    waitForTask(monitorUris[0]);
                  }
                }
              } else {
                if (!fails) {
                  complete('critical');
                  respToText(res);
                }
                fails += 1;
              }
            })
            .catch((err) => {
              promisesInProgress -= 1;
              console.error(err);
              if (!fails) {
                complete('critical', [
                  {
                    health: 'Critical',
                    msg: 'A network error occurred, unable to send request.',
                  },
                ]);
              }
              fails += 1;
            });
        });
      }
    }, [complete, respToText, taskMonitor, waitForTask]);

    useEffect(() => {
      // when initial operation fails and form is resubmitted without unmounting
      if (prevPromise && promise !== prevPromise) {
        // starting a new promise

        if (!isMountedRef.current) return null;

        setCompleted(initCompleted);
        setStatus('ok');
        setMessages([]);
        setIcon(null);
        promisesRef.current = Array.isArray(promise) ? promise : [promise];
        consecutivePollFailsRef.current = 0;

        meterAutoFillTimerRef.current = setInterval(() => {
          if (isMountedRef.current) setCompleted((val) => val + 1);
        }, meterDelaySecsPerTick * 1000);

        monitorPromise();
      }

      return () => {
        if (prevPromise === promise && meterAutoFillTimerRef.current) {
          clearInterval(meterAutoFillTimerRef.current);
          meterAutoFillTimerRef.current = null;
        }
      };
    }, [
      initCompleted,
      isMountedRef,
      meterDelaySecsPerTick,
      monitorPromise,
      prevPromise,
      promise,
    ]);

    useEffect(() => {
      // Monitoring starts here, on initial mount
      monitorPromise();
      return () => clearTimeout(waitForTaskTimerRef.current);
    }, [monitorPromise]);

    const color = `status-${status}`;

    useEffect(() => {
      if (completed >= 100) {
        if (status === 'ok') {
          setIcon(<StatusGood color={color} />);
        } else if (status === 'warning') {
          setIcon(<StatusWarning color={color} />);
        } else {
          setIcon(<StatusCritical color={color} />);
        }
      }
    }, [color, completed, status]);

    const text = name + (status === 200 ? ' Done!' : '');

    return (
      <Box
        flex={false}
        border="all"
        pad="xsmall"
        direction="column"
        fill={fill}
        margin={{ horizontal: 'none' }}
      >
        <Box direction="row">
          <Text margin={{ right: 'small' }}>{text}</Text>
          {icon}
        </Box>
        <Meter
          alignSelf="start"
          thickness="small"
          type="bar"
          size="full"
          values={[
            {
              value: completed,
              color,
            },
          ]}
        />
        <Box>
          {messages &&
            messages.map((msgObj, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box key={idx} direction="row" pad="xsmall" fill="horizontal">
                <Text margin={{ left: 'xsmall' }} size="small">
                  {msgObj.msg}
                </Text>
              </Box>
            ))}
        </Box>
      </Box>
    );
  };

  OperationBar.propTypes = {
    taskMonitor: PropTypes.string,
    initCompleted: PropTypes.number,
    promise: PropTypes.oneOfType([
      PropTypes.instanceOf(Promise),
      PropTypes.arrayOf(PropTypes.instanceOf(Promise)),
    ]),
    name: PropTypes.string.isRequired,
    estimatedTime: PropTypes.number.isRequired,
    fill: PropTypes.oneOf(['horizontal', false]),
    onComplete: PropTypes.func,
    onSuccess: PropTypes.func,
    monitorToMessages: PropTypes.func,
  };

  OperationBar.defaultProps = {
    taskMonitor: '',
    initCompleted: 1,
    fill: 'horizontal',
    promise: null,
    onComplete: () => {},
    onSuccess: () => {},
    monitorToMessages: (res) => UseMonitorResponseMessage(res),
  };

  export default OperationBar;
