import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { timeTrackingApi } from '../api';
import type { TimestampDTO } from '../types';

interface ManualEntryModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

export function ManualEntryModal({ 
  show, 
  onHide, 
  onSuccess
}: ManualEntryModalProps) {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Reset form when modal is opened
  React.useEffect(() => {
    if (show) {
      setError(null);
      setLoading(false);

      // Set default values
      const now = new Date();
      const localDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const formattedNow = `${localDate}T${hours}:${minutes}`; // Format: YYYY-MM-DDThh:mm

      setStartTime(formattedNow);
      setEndTime(formattedNow);

    }
  }, [show]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!startTime || !endTime) {
        throw new Error('Please select both start and end times');
      }

      // Remove future dates
      const now = new Date();

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (startDate > now) {
        throw new Error('Start time cannot be in the future');
      }
      if (endDate > now) {
        throw new Error('End time cannot be in the future');
      }
      if (startDate >= endDate) {
        throw new Error('End time must be after start time');
      }

      // Insert start timestamp
      const startTimestamp: TimestampDTO = {
        timestamp: startTime,
        action: 'START'
      };
      await timeTrackingApi.insertTimestamp(startTimestamp);

      // Insert end timestamp
      const endTimestamp: TimestampDTO = {
        timestamp: endTime,
        action: 'STOP'
      };
      await timeTrackingApi.insertTimestamp(endTimestamp);

      onSuccess();
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Manual Time Entry</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}



            <Form onSubmit={handleCreateSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time:</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Time:</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="w-100"
              >
                {loading ? 'Processing...' : 'Create Task'}
              </Button>
            </Form>
      </Modal.Body>
    </Modal>
  );
}
