# Proctora

Proctora is a **MERN stack** comprehensive online exam proctoring system that leverages AI to ensure the integrity of remote assessments. It features a robust backend for managing assessments and candidates, alongside real-time monitoring capabilities.

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


