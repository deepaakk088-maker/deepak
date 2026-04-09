import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './TaskForm.css';

const TaskForm = ({ onSuccess, initialData = null }) => {
  const [message, setMessage] = useState('');
  const [place, setPlace] = useState('');
  const [func, setFunc] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setMessage(initialData.message || '');
      setPlace(initialData.place || '');
      setFunc(initialData.Description || '');
      if (initialData.scheduled_time) {
        const dt = new Date(initialData.scheduled_time);
        setScheduledDate(dt.toISOString().split('T')[0]);
        setScheduledTime(dt.toTimeString().slice(0, 5));
      }
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Combine date and time
      const datetimeString = `${scheduledDate}T${scheduledTime}`;
      const scheduledTimestamp = new Date(datetimeString).toISOString();

      if (initialData && initialData.id) {
        const { error: submitError } = await supabase
          .from('tasks')
          .update({
            message,
            scheduled_time: scheduledTimestamp,
            place: place,
            Description: func
          })
          .eq('id', initialData.id);
        if (submitError) throw submitError;
      } else {
        const { error: submitError } = await supabase
          .from('tasks')
          .insert([
            {
              message,
              scheduled_time: scheduledTimestamp,
              is_sent: false,
              place: place,
              Description: func
            }
          ]);
        if (submitError) throw submitError;
      }

      // Reset form
      setMessage('');
      setPlace('');
      setFunc('');
      setScheduledDate('');
      setScheduledTime('');
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.message || 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default values for quick testing
  const setQuickTime = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    
    // Format YYYY-MM-DD
    setScheduledDate(now.toISOString().split('T')[0]);
    // Format HH:MM
    setScheduledTime(now.toTimeString().slice(0, 5));
  };

  return (
    <div className="task-form-container glass-panel">
      <h2 className="form-title">{initialData ? 'Edit Reminder' : 'Create New Reminder'}</h2>
      
      {error && (
        <div className="form-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Task / Meeting</label>
          <textarea 
            className="glass-input" 
            placeholder="e.g., Send quarterly report to the team"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={2}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Place</label>
            <input 
              type="text" 
              className="glass-input"
              placeholder="e.g., Conference Room B"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input 
              type="text" 
              className="glass-input"
              placeholder="e.g., Marketing Sync"
              value={func}
              onChange={(e) => setFunc(e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              className="glass-input"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Time</label>
            <input 
              type="time" 
              className="glass-input"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="quick-actions">
          <span className="quick-actions-label">Quick Set:</span>
          <button type="button" className="quick-btn" onClick={() => setQuickTime(5)}>+5 min</button>
          <button type="button" className="quick-btn" onClick={() => setQuickTime(15)}>+15 min</button>
          <button type="button" className="quick-btn" onClick={() => setQuickTime(60)}>+1 hour</button>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn primary-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (initialData ? 'Updating...' : 'Scheduling...') : (initialData ? 'Update Reminder' : 'Schedule Reminder')}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
