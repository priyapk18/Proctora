# Create backend and install dependencies
New-Item -ItemType Directory -Force -Path backend
Set-Location backend
npm init -y
npm install express mongoose dotenv cors jsonwebtoken bcryptjs socket.io multer xlsx nodemailer
npm install -D nodemon

# Create frontend and install dependencies
Set-Location ..
npx -y create-vite@latest frontend --template react
Set-Location frontend
npm install
npm install tailwindcss postcss autoprefixer react-router-dom axios socket.io-client face-api.js
npx tailwindcss init -p

# Git Init
Set-Location ..
git init
