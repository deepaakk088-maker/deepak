import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Clock, CheckCircle, Upload } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { supabase } from '../supabaseClient';
import * as xlsx from 'xlsx';
import './Dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTasks();
    
    // Set up realtime subscription if supabase is configured
    if (supabase) {
      const subscription = supabase
        .channel('tasks-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
          fetchTasks();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, []);

  const fetchTasks = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('scheduled_time', { ascending: true });
        
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: 'buffer', cellDates: true });
      
      const sheetName = workbook.SheetNames.includes('Weekly_Tracker') ? 'Weekly_Tracker' : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
      
      const tasksToImport = [];
      for (const row of rawData) {
        const rawTask = row['Task / Meeting'];
        const rawDate = row['Date'];
        let rawTime = row['Time'];
        
        if (!rawTask || typeof rawTask !== 'string' || !rawTask.trim()) continue;
        if (!rawDate) continue;

        let dateStr;
        if (rawDate instanceof Date) {
             dateStr = rawDate.toISOString().split('T')[0];
        } else {
             dateStr = String(rawDate);
             if (dateStr.length < 5) continue; 
        }

        let timeStr = "09:00";
        if (typeof rawTime === 'number') {
            const tm = Math.floor(rawTime * 24 * 60);
            timeStr = `${String(Math.floor(tm/60)).padStart(2,'0')}:${String(tm%60).padStart(2,'0')}`;
        } else if (typeof rawTime === 'string') {
            try {
                const match = rawTime.replace(/\./g, ':').toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
                if (match) {
                    let h = parseInt(match[1]);
                    if (match[3] === 'pm' && h < 12) h += 12;
                    if (match[3] === 'am' && h === 12) h = 0;
                    timeStr = `${String(h).padStart(2,'0')}:${match[2]}`;
                }
            } catch(e) {}
        }
        
        tasksToImport.push({
            message: rawTask.trim(),
            scheduled_time: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
            place: row['Place'] || '',
            function: row['Function '] || row['Function'] || '',
            is_sent: false
        });
      }

      if (tasksToImport.length > 0) {
         const { error } = await supabase.from('tasks').insert(tasksToImport);
         if (error) throw error;
         fetchTasks();
      }
    } catch (err) {
      console.error("Upload error: ", err);
      alert("Failed to process Excel file.");
    } finally {
      setUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.is_sent).length,
    sent: tasks.filter(t => t.is_sent).length
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header animate-fade-in animate-delay-1">
        <div>
          <h1 className="dashboard-title">
            <span className="dashboard-title-highlight">AI</span> Schedule
          </h1>
          <p className="dashboard-subtitle">Automated WhatsApp Reminders</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            className="secondary-btn flex-center"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={uploading}
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}
          >
            <Upload size={20} style={{ marginRight: '8px' }}/>
            {uploading ? 'Importing...' : 'Upload Excel'}
          </button>
          <button 
            className="primary-btn flex-center"
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
          >
            <PlusCircle size={20} style={{ marginRight: '8px' }}/>
            {showForm && !editingTask ? 'Close Form' : 'New Reminder'}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="animate-fade-in mb-xl">
          <TaskForm onSuccess={handleTaskAdded} initialData={editingTask} />
        </div>
      )}

      <div className="stats-grid mb-xl animate-fade-in animate-delay-2 mt-xl">
        <div className="stat-card glass-panel flex-center">
          <div className="stat-icon stat-icon-pending">
            <Clock size={28} />
          </div>
          <div className="stat-content">
            <h3>Pending Tasks</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card glass-panel flex-center">
          <div className="stat-icon stat-icon-success">
            <CheckCircle size={28} />
          </div>
          <div className="stat-content">
            <h3>Sent Reminders</h3>
            <p className="stat-number">{stats.sent}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content animate-fade-in animate-delay-3 mt-xl">
        <h2 className="section-title">Your Schedule</h2>
        {loading ? (
          <p className="loading-text">Loading insights...</p>
        ) : (
          <TaskList tasks={tasks} onUpdate={fetchTasks} onEdit={handleEditTask} />
        )}
      </div>
      
      {!supabase && (
        <div className="supabase-warning glass-panel animate-fade-in">
          ⚠️ <strong>Setup Required:</strong> Supabase is not configured. Please add your credentials to the .env file to enable functionality.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
