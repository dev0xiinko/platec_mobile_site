# 📚 SAMS Student Portal (Web)

A web-based student portal for the Student Attendance Management System. This replaces the mobile app with a responsive web application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > .env.local

# Start development server (on port 3001)
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001)

> **Note:** The backend (web-admin) must be running on port 3000

## 📁 Project Structure

```
student-portal/
├── app/
│   ├── (auth)/              # Login page
│   │   └── login/
│   ├── (dashboard)/         # Protected pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── attendance/      # Attendance history
│   │   ├── notifications/   # Notifications
│   │   └── profile/         # Profile page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # Reusable components
│   ├── Sidebar.tsx
│   └── Header.tsx
└── lib/
    ├── api.ts               # API client
    └── auth.tsx             # Auth context
```

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev -- -p 3001` | Start on port 3001 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

## 🔐 Student Credentials

| Email | Password |
|-------|----------|
| john@student.com | password123 |
| jane@student.com | password123 |
| mike@student.com | password123 |

## 📱 Pages

### Login (`/login`)
- Student email/password authentication
- JWT token stored in localStorage
- Automatic redirect to dashboard

### Dashboard (`/dashboard`)
- Attendance rate with visual progress bar
- Present/Absent/Late statistics
- Recent attendance records

### Attendance History (`/attendance`)
- Complete attendance log
- Pagination support
- Status badges and remarks

### Notifications (`/notifications`)
- Absence and late arrival alerts
- Read/unread status
- Click to mark as read

### Profile (`/profile`)
- Student information display
- Logout functionality

## 🎨 Design

- **Theme:** Dark with violet/purple accents
- **Components:** Button, Input, Card, Badge
- **Animations:** Fade-in, stagger delays
- **Responsive:** Works on all screen sizes

## 🔗 API Endpoints Used

All requests go through the backend at `NEXT_PUBLIC_API_URL`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student/auth/login` | POST | Student login |
| `/api/student/auth/me` | GET | Get profile |
| `/api/student/attendance` | GET | Get attendance |
| `/api/student/notifications` | GET | Get notifications |
| `/api/student/notifications/:id/read` | PUT | Mark as read |

## 🚀 Running Both Apps

**Terminal 1 - Backend (port 3000):**
```bash
cd web-admin
npm run dev
```

**Terminal 2 - Student Portal (port 3001):**
```bash
cd student-portal
npm run dev -- -p 3001
```

Then open:
- Admin Panel: http://localhost:3000
- Student Portal: http://localhost:3001
