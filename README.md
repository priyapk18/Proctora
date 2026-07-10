# Proctora

Proctora is a comprehensive online exam proctoring system that leverages AI to ensure the integrity of remote assessments. It features a robust backend for managing assessments and candidates, alongside real-time monitoring capabilities.

## Features

- **Real-Time Proctoring**: Real-time monitoring of candidates during assessments using WebSockets.
- **AI-Powered Detection**: Facial recognition and violation detection during exams.
- **Assessment Management**: Create, manage, and track assessments for candidates.
- **Candidate Dashboards**: Dedicated interfaces for candidates to take assessments securely.
- **HR/Admin Dashboard**: Monitor candidates in real-time, review alerts, and manage violations.

## Tech Stack

### Frontend
- **React.js** (built with Vite)
- **Tailwind CSS** for responsive styling
- **React Router** for navigation
- **Socket.io-client** for real-time communication
- **face-api.js** for AI facial analysis and detection

### Backend
- **Node.js & Express.js**
- **MongoDB** with Mongoose for data storage
- **Socket.io** for real-time WebSockets
- **JWT & bcryptjs** for secure authentication
- **Multer** for file uploads
- **Nodemailer** for email communications
- **xlsx** for parsing Excel files

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Proctora
   ```

2. **Setup Environment Variables**
   Create a `.env` file in the `backend` directory with your configuration. For example:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server** (in one terminal)
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Application** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will typically run on `http://localhost:5173` and the backend API on `http://localhost:5000`.

## License
MIT
