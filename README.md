# Marketing CRM

A full-stack marketing automation platform for campaign management, audience segmentation, and engagement tracking.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT

## Features
- Campaign Management (Email, SMS, Push, Social)
- Audience Segmentation with custom filters
- Email Builder with drag-drop editor and templates
- Analytics (open rate, click rate, device, geography)
- Lead capture form
- A/B test setup
- Unsubscribe management
- CSV export

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/marketing-crm.git
cd marketing-crm
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=mysecretkey123
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
BASE_URL=http://localhost:5000
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Lead capture form: http://localhost:5173/capture

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Contacts
- GET /api/contacts
- POST /api/contacts
- POST /api/contacts/bulk
- POST /api/contacts/capture (public)
- PUT /api/contacts/:id
- PUT /api/contacts/:id/unsubscribe
- DELETE /api/contacts/:id

### Segments
- GET /api/segments
- POST /api/segments
- POST /api/segments/preview
- GET /api/segments/:id/contacts
- GET /api/segments/:id/export
- DELETE /api/segments/:id

### Campaigns
- GET /api/campaigns
- POST /api/campaigns
- GET /api/campaigns/:id
- PUT /api/campaigns/:id
- DELETE /api/campaigns/:id
- POST /api/campaigns/:id/send
- POST /api/campaigns/send-test
- GET /api/campaigns/:id/track/open/:contactId
- GET /api/campaigns/:id/track/click/:contactId

## Database Schema
See ER diagram in /docs/er-diagram.png

## Demo
[Add your Loom video link here]