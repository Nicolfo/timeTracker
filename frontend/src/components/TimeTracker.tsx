import { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, ListGroup, Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { timeTrackingApi } from '../api';
import type { CurrentStatusDTO, DailySummaryDTO, WeeklySummaryDTO, TaskSummaryDTO } from '../types';
import { formatDuration, formatDateTime, formatDate, isWeekend, isHolyday, fetchHolidays } from '../utils';
import { ManualEntryModal } from './ManualEntryModal';
import { FixTimestampModal } from './FixTimestampModal';
import { ExclamationTriangle } from 'react-bootstrap-icons';


export function TimeTracker() {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatusDTO | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummaryDTO | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [showFixTimestampModal, setShowFixTimestampModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskSummaryDTO | null>(null);

  // Fetch current status
  const fetchCurrentStatus = async () => {
    try {
      const status = await timeTrackingApi.getCurrentStatus();
      setCurrentStatus(status);
    } catch (err) {
      setError('Failed to fetch current status');
      console.error(err);
    }
  };

  // Fetch daily summary
  const fetchDailySummary = async (date: string) => {
    try {
      const summary = await timeTrackingApi.getDailySummary(date);
      setDailySummary(summary);
    } catch (err) {
      setError('Failed to fetch daily summary');
      console.error(err);
    }
  };

  // Fetch weekly summary
  const fetchWeeklySummary = async (date: string) => {
    try {
      const summary = await timeTrackingApi.getWeeklySummary(date);
      setWeeklySummary(summary);
    } catch (err) {
      setError('Failed to fetch weekly summary');
      console.error(err);
    }
  };

  // Toggle time tracking (start/stop)
  const toggleTimeTracking = async () => {
    try {
      await timeTrackingApi.insertTimestamp();
      await fetchCurrentStatus();
      await fetchDailySummary(selectedDate);
      await fetchWeeklySummary(selectedDate);
    } catch (err) {
      setError('Failed to toggle time tracking');
      console.error(err);
    }
  };

  // Handle date change
  const handleDateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    await fetchHolidays(new Date(newDate).getFullYear())
    setSelectedDate(newDate);
  };

  // Load data when component mounts or date changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch holidays for the current year and next year to ensure we have data
        const currentYear = new Date().getFullYear();
        await Promise.all([
          fetchCurrentStatus(),
          fetchDailySummary(selectedDate),
          fetchWeeklySummary(selectedDate),
          fetchHolidays(currentYear),
          fetchHolidays(currentYear + 1)
        ]);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up polling for all data every minute
    const pollData = async () => {
      try {
        await Promise.all([
          fetchCurrentStatus(),
          fetchDailySummary(selectedDate),
          fetchWeeklySummary(selectedDate)
        ]);
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    const intervalId = setInterval(pollData, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [selectedDate]);

  if (loading && !currentStatus) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">Time Tracker</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header as="h2">Current Status</Card.Header>
        <Card.Body>
          {currentStatus && (
            <>
              <Card.Text>
                Status: {currentStatus.isTaskRunning ? 'Working' : 'Not working'}
              </Card.Text>
              {currentStatus.isTaskRunning && (
                <>
                  <Card.Text>Started at: {formatDateTime(currentStatus.startTime)}</Card.Text>
                  <Card.Text>Duration: {formatDuration(currentStatus.duration || 0)}</Card.Text>
                </>
              )}
              <div className="d-flex gap-2">
                <Button variant={currentStatus.isTaskRunning ? "danger" : "primary"} onClick={toggleTimeTracking}>
                  {currentStatus.isTaskRunning ? 'Stop Working' : 'Start Working'}
                </Button>
                <Button variant="secondary" onClick={() => setShowManualEntryModal(true)}>
                  Manual Entry
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h2">Select Date</Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Control 
              type="date" 
              value={selectedDate} 
              onChange={handleDateChange} 
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h2">Daily Summary</Card.Header>
        <Card.Body>
          {dailySummary && (
            <>
              <Card.Text>Date: {new Date(dailySummary.date).toLocaleDateString()}</Card.Text>
              <Card.Text>Total time: {formatDuration(dailySummary.totalMinutes)}</Card.Text>
              <h3>Tasks</h3>
              {dailySummary.tasks.length === 0 ? (
                <Card.Text>No tasks for this day</Card.Text>
              ) : (
                <ListGroup>
                  {dailySummary.tasks.map((task, index) => (
                    <ListGroup.Item key={index} className="position-relative">
                      <p>Start: {formatDateTime(task.startTime)}</p>
                      <p>End: {formatDateTime(task.endTime)}</p>
                      <p>Duration: {formatDuration(task.duration)}</p>

                      {(task.autogeneratedStart || task.autogeneratedStop) && (
                        <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${index}`}>
                                {task.autogeneratedStart && task.autogeneratedStop && "Task generated automatically based on previous entries."}
                                {task.autogeneratedStart && !task.autogeneratedStop && "Start time was automatically generated. Click to fix"}
                                {!task.autogeneratedStart && task.autogeneratedStop && "End time was automatically generated. Click to fix"}
                              </Tooltip>
                            }
                          >
                            {(task.autogeneratedStart && task.autogeneratedStop) ? <ExclamationTriangle />:
                                <Button
                                variant="warning"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowFixTimestampModal(true);
                                }}
                            >
                              <ExclamationTriangle />
                            </Button>}


                          </OverlayTrigger>
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h2">Weekly Summary</Card.Header>
        <Card.Body>
          {weeklySummary && (
            <>
              <Card.Text>Total time this week: {formatDuration(weeklySummary.totalMinutes)}</Card.Text>
              <h3>Daily Breakdown</h3>

              <div className="histogram-container" style={{ position: 'relative', marginTop: '20px', marginBottom: '10px' }}>
                {/* 8-hour line marker */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    width: '100%', 
                    borderBottom: '1px dashed #666', 
                    top: 'calc(100% - 240px)', //remember that the px are calculated from top of the container
                    zIndex: 1 
                  }}
                />
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% - 495px)', fontSize: '0.8rem', color: '#666' }}>
                  8h
                </div>

                <Row className="g-0">
                  {weeklySummary.dailySummaries.map((day, index) => {
                    const hours = day.totalMinutes / 60;
                    const isWeekendDay = isWeekend(day.date);
                    const isOverEightHours = hours > 8;
                    const isDayHoliday = isHolyday(day.date);
                    const barColor = isWeekendDay || isOverEightHours || isDayHoliday ? 'var(--bs-danger)' : 'var(--bs-primary)';
                    const heightPx = Math.min(hours * 60, 720); // Cap at 12 hours (720px) for display

                    return (
                     <Col key={index} className="text-center" style={{ flex: '1' }}>
                       <div style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                         <OverlayTrigger
                           placement="top"
                           overlay={
                             <Tooltip id={`bar-tooltip-${index}`}>
                               {formatDate(day.date)}: {formatDuration(day.totalMinutes)}
                             </Tooltip>
                           }
                         >
                           <div
                             style={{
                               height: `${heightPx}px`,
                               backgroundColor: barColor,
                               width: '80%',
                               margin: '0 auto',
                               borderTopLeftRadius: '4px',
                               borderTopRightRadius: '4px',
                               cursor: 'pointer'
                             }}
                           />
                         </OverlayTrigger>
                       </div>
                       <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                         {formatDate(day.date)}
                       </div>
                       <div style={{ fontSize: '0.8rem' }}>
                         {formatDuration(day.totalMinutes)}
                       </div>
                     </Col>
                    );
                  })}
                </Row>
              </div>

              <div className="legend mt-3">
                <div className="d-flex align-items-center mb-2">
                  <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--bs-danger)', marginRight: '10px' }}></div>
                  <span>Weekend, holiday, or over 8 hours</span>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--bs-primary)', marginRight: '10px' }}></div>
                  <span>Regular workday (under 8 hours)</span>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Manual Entry Modal */}
      <ManualEntryModal
        show={showManualEntryModal}
        onHide={() => setShowManualEntryModal(false)}
        onSuccess={() => {
          // Refresh data after successful manual entry
          fetchCurrentStatus();
          fetchDailySummary(selectedDate);
          fetchWeeklySummary(selectedDate);
        }}
      />

      {/* Fix Timestamp Modal */}
      <FixTimestampModal
        show={showFixTimestampModal}
        onHide={() => setShowFixTimestampModal(false)}
        task={selectedTask}
        onSuccess={() => {
          // Refresh data after successful timestamp fix
          fetchCurrentStatus();
          fetchDailySummary(selectedDate);
          fetchWeeklySummary(selectedDate);
        }}
      />
    </Container>
  );
}
