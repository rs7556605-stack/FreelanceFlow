# FreelanceFlow

## A Project Management Tool for Freelancers

FreelanceFlow is a web-based project and business management application designed specifically for freelancers.

It provides a centralized platform to manage clients, projects, tasks, deadlines, working hours, time logs, invoices, revenue, and outstanding payments.

The main goal of FreelanceFlow is to reduce the need for freelancers to use multiple separate tools for managing their professional activities.

---

## 👨‍💻 Developer

**Name:** Rupak Singh  
**Program:** Integrated Master of Computer Applications (Integrated MCA)  
**Academic Session:** 2026–2027  
**Project Type:** Internship Project  
**Project Category:** B2B SaaS / Project Management

---

## 📌 Project Overview

Freelancers often need different applications for:

- Client management
- Project management
- Task management
- Time tracking
- Invoice generation
- Revenue tracking
- Payment monitoring

Managing these activities separately can result in scattered information, repeated data entry, manual calculations, and difficulty tracking project deadlines and payments.

FreelanceFlow combines these activities into a single platform.

### Complete Workflow

```text
Client
   ↓
Project
   ↓
Task
   ↓
Time Tracking
   ↓
Time Log
   ↓
Invoice
   ↓
Revenue



🎯 Objectives
The main objectives of FreelanceFlow are:
- Centralize client information
- Manage freelance projects
- Organize project-related tasks
- Track deadlines
- Track working hours
- Calculate billable hours
- Generate invoices from time logs
- Monitor revenue
- Track outstanding payments
- Protect user-specific data
- Provide Free and Pro access levels
- Reduce administrative work
- Provide a professional freelancer dashboard
🚀 Features
🔐 Authentication
- User registration
- User login
- JWT authentication
- Protected routes
- Logout
- Forgot password
- OTP verification
- Password reset
- User-specific data access
📊 Dashboard
The dashboard provides an overview of the freelancer's business activities.
Dashboard includes:
- Active projects
- Total clients
- Pending invoices
- Upcoming deadlines
- Total revenue
- Outstanding payments
- Recent projects
- Revenue analytics
- Financial overview
👥 Client Management
Freelancers can manage their clients from a centralized interface.
Features:
- Add client
- View client
- Edit client
- Delete client
- Client contact information
- Default hourly rate
- Associated projects
📁 Project Management
Projects can be created and associated with specific clients.
Features:
- Create project
- Edit project
- Delete project
- Assign client
- Project budget
- Project status
- Project progress
- Start date
- Deadline
✅ Task Management
Tasks help freelancers organize project work.
Features:
- Create tasks
- Project-based tasks
- Task status
- Due dates
- Project-specific task display
- Upcoming deadlines
Tasks are associated with projects so that project-related work can be managed separately.
⏱️ Time Tracking
FreelanceFlow provides a real-time time tracking system.
Features:
- Start timer
- Stop timer
- Real-time stopwatch
- Persistent timer state
- Manual time entries
- Time logs
- Billable hours
- Billable amount calculation
Time Tracking Workflow
START
  ↓
Record Start Time
  ↓
Timer Running
  ↓
STOP
  ↓
Record End Time
  ↓
Calculate Duration
  ↓
Create Time Log
  ↓
Calculate Billable Amount

🧾 Invoice Management
Freelancers can generate invoices based on tracked working hours.
Features:
- Select client
- Select date range
- Retrieve unbilled time logs
- Calculate total hours
- Apply hourly rate
- Calculate invoice amount
- Edit invoice
- View invoice
- Invoice status
- Generate invoice PDF
- Mark time logs as billed
Invoice Workflow
Select Client
      ↓
Select Date Range
      ↓
Find Unbilled Time Logs
      ↓
Calculate Total Hours
      ↓
Apply Hourly Rate
      ↓
Calculate Amount
      ↓
Generate Invoice
      ↓
Mark Time as Billed

This reduces manual calculations and helps prevent the same time logs from being billed repeatedly.
💰 Financial Management
FreelanceFlow provides financial information through the dashboard.
Financial features:
- Total revenue
- Monthly revenue
- Pending invoices
- Outstanding payments
- Revenue analytics
- Revenue charts
🔒 Security
FreelanceFlow uses several security mechanisms.
Security features:
- JWT authentication
- Protected routes
- Authorization checks
- User-specific database queries
- Password protection
- Environment variables
- Data isolation
- Authentication validation
Each user's data is associated with the authenticated user's identity to prevent unauthorized access to another user's information.
🏗️ System Architecture
                         USER
                           |
                           ↓
                   REACT FRONTEND
                           |
                           ↓
                      REST API
                           |
                           ↓
                  NODE.JS + EXPRESS
                           |
             +-------------+-------------+
             |             |             |
             ↓             ↓             ↓
       AUTHENTICATION  BUSINESS LOGIC  EMAIL
             |             |
             |             ↓
             |         MONGODB
             |
             ↓
            JWT

Frontend
The frontend manages:
- User interface
- Navigation
- Forms
- Dashboard
- Client pages
- Project pages
- Task pages
- Time tracking interface
- Invoice interface
- Financial charts
Backend
The backend manages:
- Authentication
- Authorization
- REST APIs
- Business logic
- CRUD operations
- Time calculations
- Invoice calculations
- Financial processing
- Email processing
- Database communication
Database
MongoDB stores application data including:
- Users
- Clients
- Projects
- Tasks
- Time logs
- Invoices
🛠️ Technology Stack
Frontend
- React.js
- JavaScript ES6+
- HTML5
- CSS3
- Tailwind CSS
- React Router
Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
Database
- MongoDB
- MongoDB Atlas
- Mongoose
UI and Visualization
- Lucide React
- Recharts
Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman
- npm
- Browser Developer Tools
🗄️ Database Design
The main collections used by FreelanceFlow are:
User
Client
Project
Task
TimeLog
Invoice

Relationship
User
 |
 +---- Client
        |
        +---- Project
               |
               +---- Task
               |
               +---- TimeLog
 |
 +---- Invoice

User-specific records are associated with the authenticated user's ID.
🔌 API Functionality
The backend provides API functionality for:
- Authentication
- Clients
- Projects
- Tasks
- Time Tracking
- Time Logs
- Invoices
- Financial information
- Contact form
Example API Categories
/api/auth
/api/clients
/api/projects
/api/tasks
/api/invoices

📂 Project Structure
A typical project structure is:
FreelanceFlow/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore

The exact folder structure may vary depending on the project version.

💻 Installation
Requirements
Before running FreelanceFlow, install:
- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git
- Modern web browser
- Visual Studio Code (recommended)
1. Clone the Repository
git clone:https://github.com/rs7556605-stack/FreelanceFlow
Then move into the project directory:
cd FreelanceFlow

2. Install Dependencies
Install frontend dependencies:
cd frontend
npm install

Install backend dependencies:
cd ../backend
npm install

⚙️ Environment Variables
Create an environment file for the backend.
Example:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_sender_email

Important
Never upload real:
- Passwords
- API keys
- JWT secrets
- MongoDB credentials
- Email credentials
to a public GitHub repository.
Use .gitignore to protect environment files.
Example:
.env
node_modules/

▶️ Running the Project
Start Backend
cd backend
npm start

or, if a development script is configured:
npm run dev

Start Frontend
Open another terminal:
cd frontend
npm start

The application will then be available through the local development server.
🧪 Testing
The following major areas are tested:
Authentication
- Registration
- Login
- Logout
- Forgot password
- OTP verification
- Password reset
Client Management
- Create client
- View client
- Update client
- Delete client
Project Management
- Create project
- Update project
- Delete project
- Client-project relationship
Task Management
- Create task
- Project-based task display
- Task status
- Due dates
Time Tracking
- Start timer
- Stop timer
- Time logs
- Manual entries
- Billable calculations
Invoice Management
- Client selection
- Date range
- Unbilled time
- Amount calculation
- Invoice generation
- Invoice status
Security
- Protected routes
- JWT authentication
- User data isolation
Responsive UI
The interface is designed to work across:
- Desktop
- Laptop
- Tablet
- Mobile devices
🚀 Deployment
FreelanceFlow can be deployed using modern web hosting platforms.
Frontend
A frontend hosting service can be used for the React application.
Backend
A Node.js and Express-compatible hosting platform can be used for the backend.
Database
MongoDB Atlas can be used for cloud database hosting.
Before production deployment, configure all required environment variables.
🌐 Live Project
The live project link is provided separately in:
Live_Link:https://rs7556605-stack.github.io/FreelanceFlow


📸 Project Screenshots
Screenshots of the project interface can be added here.
Recommended screenshots:
1. Login Page
2. Dashboard
3. Client Management
4. Client Details
5. Project Management
6. Task Management
7. Time Tracking
8. Invoice Management
9. Revenue Analytics
10. Settings
Example:
![Dashboard](screenshots/dashboard.png)


🔮 Future Scope
Future versions of FreelanceFlow can include:
- AI-powered task suggestions
- AI business insights
- Advanced productivity tracking
- Online payment gateways
- Automated payment reminders
- Client portal
- Real-time notifications
- Mobile application
- Expense management
- Advanced financial reports
- Team collaboration
- Two-factor authentication
- Advanced audit logs
- Improved scalability and performance
🎓 Internship Learning Outcomes
This project provides practical experience in:
- React.js development
- Backend development
- REST API development
- MongoDB database management
- JWT authentication
- CRUD operations
- Full-stack application development
- Time tracking systems
- Invoice calculation
- Financial data visualization
- Responsive UI development
- Git and GitHub
- Software testing
- Deployment concepts
📈 Benefits
FreelanceFlow provides:
- Centralized freelancer management
- Better project organization
- Improved deadline management
- Accurate time tracking
- Easier invoice preparation
- Improved financial visibility
- Reduced administrative work
- Secure user data
- Professional workflow management
📝 Conclusion
FreelanceFlow demonstrates the development of a practical web-based SaaS application for freelancer project and business management.
The application combines client management, project management, task management, time tracking, invoice management, financial analytics, authentication, and access control into a single platform.
The project demonstrates practical implementation of modern frontend, backend, database, REST API, authentication, and SaaS concepts.
👨‍💻 Author
Rupak Singh
Integrated Master of Computer Applications
Academic Session: 2026–2027
Project
FreelanceFlow
Project Title
A Project Management Tool for Freelancers
⭐ Acknowledgement
This project was developed as part of the internship program to gain practical experience in full-stack web application development and modern software engineering practices.
