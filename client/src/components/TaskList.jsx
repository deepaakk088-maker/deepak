import React from 'react';
import { supabase } from '../supabaseClient';
import { format, isPast } from 'date-fns';
import { Trash2, MessageSquare, Check, Clock, MapPin, Briefcase, Edit2 } from 'lucide-react';
import './TaskList.css';

const TaskList = ({ tasks, onUpdate, onEdit }) => {
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <div className="empty-state-icon">
          <MessageSquare size={40} />
        </div>
        <p>No reminders scheduled yet.</p>
        <span>Click "New Reminder" to get started.</span>
      </div>
    );
  }

  return (
    <div className="task-list-container glass-panel">
      <div className="table-responsive">
        <table className="master-schedule-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Task / Meeting</th>
              <th>Place</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const scheduledTime = new Date(task.scheduled_time);
              const isSent = task.is_sent;
              const pastDue = isPast(scheduledTime) && !isSent;
              const delayClass = `animate-delay-${Math.min((index % 3) + 1, 3)}`;

              return (
                <tr 
                  key={task.id} 
                  className={`task-row animate-fade-in ${delayClass} ${isSent ? 'sent' : ''} ${pastDue ? 'past-due' : ''}`}
                >
                  <td className="col-date">
                    <div className="cell-content">
                      <Clock size={14} className="icon-subtle" />
                      {format(scheduledTime, 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="col-time">
                    <div className="cell-content time-text">
                      {format(scheduledTime, 'p')}
                    </div>
                  </td>
                  <td className="col-message">
                    <div className="cell-content primary-text">
                      {task.message}
                    </div>
                  </td>
                  <td className="col-place">
                    <div className="cell-content">
                      {task.place ? <MapPin size={14} className="icon-subtle" /> : null}
                      <span className="truncate">{task.place || '-'}</span>
                    </div>
                  </td>
                  <td className="col-function">
                    <div className="cell-content">
                      {task.Description ? <Briefcase size={14} className="icon-subtle" /> : null}
                      <span className="truncate">{task.Description || '-'}</span>
                    </div>
                  </td>
                  <td className="col-status">
                    <div className={`status-badge ${isSent ? 'success' : pastDue ? 'warning' : 'pending'}`}>
                      {isSent ? 'Sent' : pastDue ? 'Past Due' : 'Pending'}
                    </div>
                  </td>
                  <td className="col-actions">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="edit-btn-table" 
                        onClick={() => onEdit && onEdit(task)}
                        title="Edit reminder"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="delete-btn-table" 
                        onClick={() => handleDelete(task.id)}
                        title="Delete reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
