# Personal AI Scheduler

A full-stack web application designed to help you manage your tasks and automatically receive reminders via WhatsApp. The project consists of a React frontend for task management and a Node.js backend that schedules and dispatches WhatsApp messages.

## How It Works

1. **Task Creation**: Users interact with a modern, glassmorphism-styled React frontend to create, edit, and schedule tasks or events.
2. **Data Storage**: The tasks are securely stored in a **Supabase** backend (PostgreSQL database).
3. **Automated Scheduling**: A Node.js server continuously runs in the background. It uses `node-cron` to periodically check the Supabase database for tasks that are due soon.
4. **WhatsApp Notifications**: When a task's reminder time approaches, the backend utilizes `whatsapp-web.js` to automate a WhatsApp Web session and send a designated reminder message directly to the user's phone.

## Tech Stack

The project is divided into an isolated Client (Frontend) and Server (Backend) architecture, utilizing the following technologies:

### Frontend (Client)
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Modern aesthetic with glassmorphism, smooth animations, and dark-mode support)
- **Routing**: `react-router-dom`
- **Form Handling**: `react-hook-form`
- **Icons**: `lucide-react`
- **Date Formatting**: `date-fns`
- **Database Client**: `@supabase/supabase-js`

### Backend (Server)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Job Scheduler**: `node-cron`
- **WhatsApp API**: `whatsapp-web.js` (Automates WhatsApp Web functionality)
- **QR Code Generation**: `qrcode-terminal` (Used to authenticate the WhatsApp session in the terminal)
- **Environment Management**: `dotenv`
- **CORS Management**: `cors`
- **Database Client**: `@supabase/supabase-js`

### Database
- **Provider**: [Supabase](https://supabase.com/) (Open-source Firebase alternative powered by PostgreSQL)

## Key Packages Used

**Client (`package.json`)**
- `@supabase/supabase-js`: Integrating the frontend with the Supabase database.
- `react-hook-form`: Efficient and flexible form validation for creating tasks.
- `date-fns`: Comprehensive toolset for manipulating and formatting dates on the UI.
- `lucide-react`: Crisp and customizable SVG icons for the modern UI.

**Server (`package.json`)**
- `express`: Minimalist web framework for creating the server health checks and API endpoints.
- `node-cron`: Time-based job scheduler for Node.js, used to repeatedly check for pending task reminders.
- `whatsapp-web.js`: A WhatsApp API client that connects via the WhatsApp Web browser app, allowing automated message sending.
- `qrcode-terminal`: Displays the WhatsApp Web QR code in the terminal so the user can link their WhatsApp account upon server startup.

## Getting Started

### Prerequisites
- Node.js installed
- A Supabase account and project
- A WhatsApp account on your smartphone

### Installation

1. **Clone the repository.**
2. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```
3. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

### Configuration

Create a `.env` file in both the `client` and `server` directories based on your Supabase credentials:

**Client `.env` / Server `.env`**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# On the server side, you might also have:
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### Running the Application

You can start both the client and the server simultaneously using the provided startup script (if you are on Windows):
```bash
start.bat
```

Alternatively, to run them individually:
- **Client**: `npm run dev` in the `client` directory.
- **Server**: `npm start` in the `server` directory.

> **Note**: When you start the server for the first time, you must look at your terminal and scan the generated QR code with your WhatsApp mobile app to link your account and enable automated messaging.
