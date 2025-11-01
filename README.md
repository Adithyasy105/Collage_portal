# 🎓 ITI College Portal - Complete ERP System

A comprehensive Enterprise Resource Planning (ERP) system for ITI (Industrial Training Institute) colleges. This full-stack application manages students, staff, attendance, marks, leave applications, and administrative operations with a modern, responsive interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Free Deployment Guide](#free-deployment-guide)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Future Improvements & Features](#future-improvements--features)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## ✨ Features

### 👨‍🎓 Student Portal
- **Dashboard**: Overview of attendance, marks, and academic progress
- **Profile Management**: Complete student profile with photo upload
- **Attendance Tracking**: View attendance by subject with detailed session information
- **Marks & Results**: View assessment marks and final results
- **Leave Application**: Submit leave applications with letter upload
- **Feedback System**: Rate and provide feedback to teachers
- **Academic Calendar**: View terms, holidays, and important dates

### 👨‍🏫 Staff Portal
- **Dashboard**: Overview of assigned classes and students
- **Profile Management**: Complete staff profile management
- **Attendance Management**: Mark student attendance for class sessions
- **Marks Upload**: Upload and manage student assessment marks
- **Leave Applications**: Review and approve/reject student leave applications
- **Session Management**: Create and manage class sessions
- **Student Feedback**: View feedback and ratings from students

### 👨‍💼 Admin Portal
- **User Management**: Create, update, and manage users (students, staff, admins)
- **Master Data Management**: Manage departments, programs, sections, terms, subjects
- **Holiday Management**: Add and manage academic holidays
- **Staff Assignments**: Assign staff to subjects, sections, and terms
- **Results Generation**: Automatically calculate and generate student results
- **Analytics Dashboard**: View teacher ratings, feedback analytics, and statistics
- **Data Import**: Bulk import users via CSV
- **Audit Logs**: Track all administrative actions

### 🌐 Public Portal
- **Modern Landing Page**: Beautiful, responsive homepage with video background
- **Course Information**: Display all available courses
- **Admission Form**: Online admission form submission
- **Contact Form**: Contact the institute directly
- **Tools & Equipment**: Showcase laboratory tools and equipment
- **Leadership**: Display institute leadership information

---

## 🛠 Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **React Router DOM 7.8.2** - Routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **React Toastify** - Notifications
- **CSS Modules** - Scoped styling

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **Prisma 6.18.0** - ORM for database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Twilio** - SMS service (optional)
- **Supabase** - File storage

### DevOps & Tools
- **Prisma Migrations** - Database versioning
- **Node-Cron** - Scheduled jobs
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **PostgreSQL** >= 12.0 ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** (for file storage) - [Sign Up](https://supabase.com)

---

## 🚀 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd collage_potal
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables template
# Create a .env file in the backend directory
cp .env.example .env  # Or create manually
```

### Step 3: Database Setup

1. **Create PostgreSQL Database**:
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE college_portal;
   \q
   ```

2. **Update Database URL in `.env`**:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/college_portal?schema=public"
   ```

3. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Seed Database (Optional)**:
   ```bash
   # You can create a seed script or manually insert data
   ```

### Step 4: Configure Environment Variables

Create `backend/.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/college_portal?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=5000
NODE_ENV=development

# Supabase (File Storage)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Email (Nodemailer - Gmail example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# SMS (Twilio - Optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### Step 5: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Step 6: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frountend/college-portal-frontend

# Install dependencies
npm install

# Create .env file (if needed)
echo "REACT_APP_API_URL=http://localhost:5000" > .env
```

### Step 7: Start Frontend Development Server

```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes | - |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `SUPABASE_URL` | Supabase project URL | ✅ Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Yes | - |
| `EMAIL_HOST` | SMTP server host | No | smtp.gmail.com |
| `EMAIL_PORT` | SMTP server port | No | 587 |
| `EMAIL_USER` | Email username | No | - |
| `EMAIL_PASS` | Email password/app password | No | - |
| `EMAIL_FROM` | Default sender email | No | - |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API URL | No | http://localhost:5000 |

---

## 🗄 Database Setup

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset
```

### Database Schema Overview

The application uses Prisma ORM with PostgreSQL. Key models include:
- `User` - Authentication and user accounts
- `Student` - Student profiles and information
- `Staff` - Staff profiles and information
- `Attendance` - Attendance records
- `Mark` - Assessment marks
- `ClassSession` - Class scheduling
- `Subject` - Course subjects
- `Section` - Class sections
- `Program` - Academic programs
- `AcademicTerm` - Academic terms
- `LeaveApplication` - Student leave requests
- `Feedback` - Teacher feedback and ratings
- `Result` - Final student results
- `Holiday` - Academic holidays

---

## 🚀 Free Deployment Guide

### Option 1: Vercel (Frontend) + Render (Backend) + Supabase (Database)

This is the **recommended** combination for free hosting.

#### Frontend Deployment on Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy Frontend**:
   ```bash
   cd frountend/college-portal-frontend
   vercel
   ```

4. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`

5. **Update API URLs**:
   - In `frountend/college-portal-frontend/src/api/*.js`, replace `http://localhost:5000` with your Render backend URL

#### Backend Deployment on Render

1. **Create Render Account**: [Sign Up](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select `backend` folder as root directory
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

3. **Configure Environment Variables** in Render Dashboard:
   - Add all variables from `backend/.env`
   - Update `DATABASE_URL` to your free PostgreSQL database (see below)

4. **PostgreSQL Database on Render**:
   - Create a new PostgreSQL database in Render
   - Copy the connection string
   - Update `DATABASE_URL` in environment variables

5. **Post-Deployment**:
   ```bash
   # SSH into Render or use their console
   npx prisma migrate deploy
   npx prisma generate
   ```

#### Alternative: Railway (All-in-One)

1. **Create Railway Account**: [Sign Up](https://railway.app)

2. **Deploy Backend**:
   - Create new project → Deploy from GitHub
   - Select `backend` folder
   - Railway auto-detects Node.js
   - Add environment variables
   - Railway provides PostgreSQL database automatically

3. **Deploy Frontend**:
   - Create new service → Static site
   - Build command: `npm install && npm run build`
   - Output directory: `build`
   - Add environment variable: `REACT_APP_API_URL`

### Option 2: Netlify (Frontend) + Fly.io (Backend)

#### Frontend on Netlify

1. **Connect Repository**: [Netlify Dashboard](https://app.netlify.com)

2. **Build Settings**:
   - Base directory: `frountend/college-portal-frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`

3. **Environment Variables**:
   - Add `REACT_APP_API_URL` with your backend URL

#### Backend on Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Initialize**:
   ```bash
   cd backend
   fly launch
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

### Option 3: Free PostgreSQL Databases

- **Supabase** (Recommended): [supabase.com](https://supabase.com) - 500MB free tier
- **Neon**: [neon.tech](https://neon.tech) - Serverless PostgreSQL, generous free tier
- **Render**: [render.com](https://render.com) - Free PostgreSQL (with limitations)
- **Railway**: [railway.app](https://railway.app) - Included with deployment

### Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database migrated and connected
- [ ] Environment variables configured
- [ ] CORS configured for frontend URL
- [ ] Supabase storage buckets created
- [ ] Email service configured (optional)
- [ ] API URLs updated in frontend code
- [ ] Test all major features after deployment

---

## 📁 Project Structure

```
collage_potal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/             # Database migrations
│   ├── scripts/
│   │   └── src/
│   │       ├── config/             # Configuration files
│   │       ├── controllers/        # Business logic
│   │       ├── routes/             # API routes
│   │       ├── middleware/         # Express middleware
│   │       ├── utils/              # Utility functions
│   │       └── jobs/               # Scheduled jobs
│   ├── server.js                   # Entry point
│   └── package.json
│
├── frountend/
│   └── college-portal-frontend/
│       ├── public/                 # Static files
│       ├── src/
│       │   ├── api/                # API client functions
│       │   ├── components/         # React components
│       │   ├── pages/              # Page components
│       │   ├── styles/             # CSS modules
│       │   └── App.js              # Main app component
│       └── package.json
│
└── README.md                       # This file
```

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user

### Student Endpoints

- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/attendance` - Get attendance records
- `GET /api/students/marks` - Get marks
- `POST /api/students/feedback` - Submit feedback

### Staff Endpoints

- `GET /api/staff/profile` - Get staff profile
- `PUT /api/staff/profile` - Update staff profile
- `POST /api/staff/sessions` - Create class session
- `POST /api/staff/attendance` - Mark attendance
- `POST /api/staff/marks` - Upload marks

### Admin Endpoints

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/upload` - Upload users CSV
- `GET /api/admin/departments` - Get departments
- `GET /api/admin/programs` - Get programs
- `GET /api/admin/sections` - Get sections
- `GET /api/admin/terms` - Get terms
- `GET /api/admin/subjects` - Get subjects
- `POST /api/admin/generate-results` - Generate results

---

## 🔮 Future Improvements & Features

### 📊 Enhanced Analytics & Reporting

1. **Advanced Dashboard Analytics**
   - Real-time attendance monitoring with alerts
   - Performance trends over time (charts and graphs)
   - Comparative analysis between sections/programs
   - Export reports to PDF/Excel
   - Custom date range filtering

2. **Financial Management Module**
   - Fee collection and tracking
   - Fee reminders and late payment notifications
   - Payment gateway integration (Razorpay, Stripe)
   - Financial reports and statements
   - Scholarship and discount management

3. **Inventory Management**
   - Laboratory equipment tracking
   - Tool maintenance schedules
   - Equipment booking system
   - Purchase and requisition management
   - Stock alerts for low inventory

### 📱 Mobile Application

4. **React Native Mobile App**
   - Native mobile apps for iOS and Android
   - Push notifications for important updates
   - Offline mode support
   - QR code attendance scanning
   - Mobile-first design for better UX

### 🎓 Enhanced Academic Features

5. **Exam Management System**
   - Exam scheduling and timetable generation
   - Hall ticket generation
   - Online exam portal (quiz/exam taking)
   - Automatic grading for MCQ questions
   - Question paper bank management

6. **Library Management**
   - Book catalog and search
   - Book issue/return system
   - Due date reminders
   - Fine calculation
   - Digital library for e-books

7. **Assignment & Project Management**
   - Assignment creation and distribution
   - Online submission portal
   - Plagiarism checking integration
   - Peer review system
   - Project collaboration tools

### 💬 Communication Features

8. **Messaging & Notifications**
   - In-app messaging system
   - Group chat for classes/sections
   - Announcement broadcasting
   - Email notifications (comprehensive)
   - SMS notifications for critical updates
   - WhatsApp integration (using Twilio API)

9. **Notice Board**
   - Digital notice board
   - Category-based notices
   - Important announcements pinning
   - Notice expiry dates
   - Email/SMS alerts for new notices

### 🔐 Security & Compliance

10. **Enhanced Security**
    - Two-factor authentication (2FA)
    - Role-based access control (RBAC) refinement
    - Audit trail for all actions
    - IP whitelisting for admin access
    - Session management and timeout
    - Password strength requirements

11. **Data Backup & Recovery**
    - Automated daily backups
    - Point-in-time recovery
    - Data export functionality
    - GDPR compliance features
    - Data retention policies

### 🎨 User Experience Improvements

12. **Advanced UI/UX Features**
    - Dark mode toggle
    - Multi-language support (i18n)
    - Accessibility improvements (WCAG compliance)
    - Customizable dashboard layouts
    - Drag-and-drop file uploads
    - Advanced search and filtering

13. **Gamification**
    - Student achievement badges
    - Leaderboards for attendance/marks
    - Reward points system
    - Student of the month/year
    - Progress tracking with visual indicators

### 🔗 Integration Features

14. **Third-Party Integrations**
    - Google Calendar integration
    - Microsoft Teams/Zoom integration
    - Payment gateway integration (Razorpay, Stripe, PayPal)
    - SMS gateway (Twilio, AWS SNS)
    - Email service (SendGrid, Mailgun)
    - Cloud storage (AWS S3, Google Cloud Storage)

15. **ERP Integration**
    - Payroll management for staff
    - Time tracking system
    - Leave management for staff
    - Performance appraisal system
    - Asset management

### 📈 Advanced Features

16. **AI & Machine Learning**
    - Attendance prediction models
    - Performance analytics and recommendations
    - Automated timetable optimization
    - Chatbot for student queries
    - Sentiment analysis of feedback

17. **Video & E-Learning**
    - Video lecture recording and storage
    - Live streaming for classes
    - Video library management
    - Screen recording for exams
    - Interactive whiteboard

18. **Portfolio & Certification**
    - Student portfolio creation
    - Digital certificate generation
    - Skill badge system
    - Resume builder from student data
    - LinkedIn integration

### 🎯 Administrative Enhancements

19. **Advanced Admin Features**
    - Bulk operations (bulk user creation, updates)
    - Data import/export in multiple formats
    - Custom report builder
    - Email templates management
    - System configuration panel
    - Database maintenance tools

20. **Admission & Enrollment**
    - Online admission portal with payment
    - Document verification system
    - Admission test/exam portal
    - Merit list generation
    - Seat allocation automation

### 📊 Business Intelligence

21. **Business Intelligence Dashboard**
    - Real-time analytics dashboard
    - Predictive analytics
    - Custom KPI tracking
    - Data visualization improvements
    - Export to business intelligence tools

22. **Compliance & Reporting**
    - Government compliance reports
    - Automated regulatory reporting
    - Statutory document generation
    - Annual report generation

### 🔧 Technical Improvements

23. **Performance Optimization**
    - API response caching (Redis)
    - Database query optimization
    - Image optimization and CDN
    - Lazy loading for better performance
    - Code splitting and lazy loading

24. **Scalability**
    - Microservices architecture migration
    - Load balancing
    - Database sharding
    - Horizontal scaling support
    - Docker containerization

25. **Testing & Quality**
    - Comprehensive unit tests
    - Integration tests
    - End-to-end testing (Cypress/Playwright)
    - Performance testing
    - Security testing

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ES6+ JavaScript conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code style
- Write tests for new features

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- Check if PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure all dependencies are installed: `npm install`
- Check if port 5000 is available

#### Database connection errors
- Verify PostgreSQL credentials
- Check if database exists
- Run migrations: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`

#### Frontend build fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (>= 18.0.0)
- Clear cache: `npm cache clean --force`

#### CORS errors
- Update `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in `server.js`

#### File upload issues
- Verify Supabase credentials
- Check if storage buckets exist
- Verify file size limits

### Getting Help

- Check existing issues on GitHub
- Create a new issue with detailed description
- Include error messages and logs
- Provide steps to reproduce

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Prisma team for the excellent ORM
- All open-source contributors

---

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.

---

**Made with ❤️ for ITI Colleges**

