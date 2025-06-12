import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { timeTrackingApi } from '../api';
import type { TimestampDTO, TaskSummaryDTO } from '../types';
import { formatDateTime } from '../utils';

interface FixTimestampModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  task: TaskSummaryDTO | null;
}

export function FixTimestampModal({ 
  show, 
  onHide, 
  onSuccess,
  task
}: FixTimestampModalProps) {
  const [timestamp, setTimestamp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Reset form when modal is opened
  React.useEffect(() => {
    if (show && task) {
      setError(null);
      setLoading(false);

      // Determine if start or end time is auto-generated (00:00)
      const startDate = new Date(task.startTime);
      const isStartGenerated = startDate.getHours() === 0 && startDate.getMinutes() === 0;
      
      // Set default value to the current time on the same day as the auto-generated timestamp
      const now = new Date();
      const timestampDate = isStartGenerated ? new Date(task.startTime) : new Date(task.endTime);
      
      // Keep the date but use current time
      timestampDate.setHours(now.getHours());
      timestampDate.setMinutes(now.getMinutes());
      
      const localDate = timestampDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const hours = String(timestampDate.getHours()).padStart(2, '0');
      const minutes = String(timestampDate.getMinutes()).padStart(2, '0');
      const formattedTimestamp = `${localDate}T${hours}:${minutes}`; // Format: YYYY-MM-DDThh:mm
      
      setTimestamp(formattedTimestamp);
    }
  }, [show, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    setLoading(true);
    setError(null);

    try {
      if (!timestamp) {
        throw new Error('Please select a time');
      }

      // Determine if start or end time is auto-generated
      const startDate = new Date(task.startTime);
      const isStartGenerated = startDate.getHours() === 0 && startDate.getMinutes() === 0;
      
      // Create timestamp with appropriate action
      const timestampDTO: TimestampDTO = {
        timestamp: timestamp,
        action: isStartGenerated ? 'START' : 'STOP'
      };
      
      await timeTrackingApi.insertTimestamp(timestampDTO);

      onSuccess();
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  // Determine if start or end time is auto-generated
  const startDate = new Date(task.startTime);
  const isStartGenerated = startDate.getHours() === 0 && startDate.getMinutes() === 0;
  const generatedTime = isStartGenerated ? task.startTime : task.endTime;
  const timeType = isStartGenerated ? 'start' : 'end';

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Fix Auto-generated Timestamp</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <p>
          The {timeType} time of this task was automatically generated as {formatDateTime(generatedTime)}.
          Please provide the actual {timeType} time:
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Actual {timeType} time:</Form.Label>
            <Form.Control
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
            />
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="w-100"
          >
            {loading ? 'Processing...' : 'Fix Timestamp'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}