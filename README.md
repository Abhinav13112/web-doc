# DocuVault - Production-Ready Document Management System

![DocuVault Banner](https://img.shields.io/badge/DocuVault-Cloud%20Document%20Management-026bc9?style=for-the-badge&logo=icloud&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

DocuVault is a secure, modern, full-stack Document Management System inspired by Google Drive, Notion, and OneDrive. It offers authenticated multi-tenant file management, drag-and-drop batch uploads, safe server-side magic byte validation, client-side document previews (PDF, Word, Excel, CSV, Images, Code, and Markdown), expiring private download links, Row Level Security (RLS), and light/dark theme modes.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Database & Storage Setup](#-database--storage-setup)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Document Preview Capabilities](#-document-preview-capabilities)
- [Security & Validation](#-security--validation)
- [Step-by-Step Deployment Guide](#-step-by-step-deployment-guide)
  - [Frontend (Vercel)](#1-deploying-the-frontend-on-vercel)
  - [Backend (Render)](#2-deploying-the-backend-on-render)
- [License](#-license)

---

## 🚀 Key Features

### 1. Modern Responsive UI & Dashboard
- **Sleek Aesthetic**: Inspired by Google Drive and Notion, with rounded container styling and fluid animations.
- **Light & Dark Mode**: Seamless toggle with auto-detection of operating system preferences and localStorage persistence.
- **Dashboard Overview**: Displays real-time document count, storage consumed with progress towards quota (500 MB), category breakdown, and recent uploads.
- **Dynamic Navigation Sidebar**: Quick navigation across All Documents, PDFs, Word, Spreadsheets, Presentations, Images, Other Files, Favorites, and Trash.

### 2. Multi-File Drag-and-Drop Upload System
- Multi-file selection via system file picker or drag-and-drop zone.
- Individual upload queue with real-time percentage progress bars, status indicators (Uploading, Success, Duplicate, Failed), and file cancellation.
- Duplicate detection in queue.
- Configurable upload limits (default: 50 MB per file, max 10 files per batch).

### 3. Comprehensive Document Library
- **Grid View & List View**: Toggle between spacious card grid view and compact detailed table rows.
- **Search & Filtering**: Instant, debounced search across filenames and tags, with category filter pills.
- **Sorting & Pagination**: Sort by Upload Date, File Name, File Size, or Category in ascending/descending order.
- **Document Actions**: Star/Unstar favorites, in-line rename, move to trash, restore from trash, permanent deletion, and secure download.

### 4. Zero-Leak Document Previews
- **PDF**: Embedded canvas/iframe viewer with page controls, zoom, and open in new window.
- **Word (.docx)**: Native client-side conversion to clean HTML via `mammoth`, sanitized via `DOMPurify` to prevent XSS.
- **Excel & CSV (.xlsx, .xls, .csv, .ods)**: Multi-sheet workbook tabs, interactive styled data grid with row numbering.
- **PowerPoint (.pptx)**: Metadata info card and direct download action.
- **Images (.jpg, .png, .webp, .svg, .gif)**: Interactive viewer with zoom-in/out and pan.
- **Code & Markdown**: Syntax styled text viewer with line numbers.
- **Other / Archives**: Rich metadata cards with download button.

### 5. Private Cloud Storage & Security
- **Supabase Storage**: Stored in a private `documents` bucket.
- **Expiring Signed URLs**: Previews and downloads use time-limited (1-hour) signed URLs.
- **Row Level Security (RLS)**: Enforced in PostgreSQL and Supabase Storage so users cannot view, modify, or delete another user's documents.
- **Magic Byte Signature Inspection**: Server-side inspection of binary headers prevents executable files disguised as documents.
- **Instant Demo Mode**: Includes an instant sandbox mode to test the UI and features out-of-the-box before configuring Supabase credentials.

---

## 🛠 Architecture & Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Blazing fast client development and optimized production bundling |
| **Styling** | Tailwind CSS | Modern utility-first responsive styling and dark mode |
| **Icons** | Lucide React | Lightweight, consistent SVG icon set |
| **Document Parsers** | SheetJS (xlsx), Mammoth, DOMPurify | In-browser document parsing and sanitized HTML rendering |
| **Backend API** | Node.js + Express.js | Modular REST API with Multer, Helmet, CORS, and rate limiting |
| **Database** | PostgreSQL via Supabase | Relational metadata persistence with Row Level Security (RLS) |
| **Cloud Storage** | Supabase Storage | Encrypted, private cloud object storage |
| **Authentication** | Supabase Auth | Secure JWT session management and user identities |

---

## 📁 Project Structure

```text
pdf_web/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js             # Supabase admin and user-scoped client initializers
│   │   ├── controllers/
│   │   │   ├── documentController.js   # Upload, query, preview, download, rename, trash, delete
│   │   │   └── userController.js       # User profile and storage usage controller
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT bearer token verification
│   │   │   ├── upload.js               # Multer memory storage and upload limit filters
│   │   │   └── validateFile.js         # Magic byte signature and user quota validation
│   │   ├── routes/
│   │   │   ├── documents.js            # Document REST endpoints
│   │   │   ├── user.js                 # User profile endpoints
│   │   │   └── health.js               # Service health check and uptime monitor
│   │   ├── utils/
│   │   │   └── fileHelpers.js          # File type mappings, sanitizers, and magic byte checkers
│   │   └── server.js                   # Express application entrypoint and middleware pipeline
│   ├── .env.example
│   ├── package.json
│   ├── Procfile
│   └── render.yaml                     # Render deployment configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx  # Reusable confirmation dialog for destructive actions
│   │   │   ├── DocumentCard.jsx        # Grid card layout for documents
│   │   │   ├── DocumentListItem.jsx    # Table row layout for documents
│   │   │   ├── DocumentPreviewModal.jsx# Multi-format document viewer (PDF, Word, Excel, etc.)
│   │   │   ├── FileIcon.jsx            # Color-coded category and extension icons
│   │   │   ├── Navbar.jsx              # Search, upload trigger, theme toggle, profile menu
│   │   │   ├── RenameModal.jsx         # Clean file rename dialog
│   │   │   ├── Sidebar.jsx             # Category navigation, trash, favorites, and storage meter
│   │   │   ├── Toast.jsx               # Floating toast notifications
│   │   │   └── UploadModal.jsx         # Drag-and-drop batch upload modal with progress bars
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Supabase Auth state, demo mode, sign-in/up methods
│   │   │   └── ThemeContext.jsx        # Light/dark theme management and persistence
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx            # Sign-in, sign-up, and forgot password portal
│   │   │   ├── DashboardPage.jsx       # Analytics, category distribution, recent uploads
│   │   │   ├── DocumentsPage.jsx       # Document browsing, filtering, sorting, and pagination
│   │   │   ├── FavoritesPage.jsx       # Starred documents collection
│   │   │   ├── SettingsPage.jsx        # Profile, storage quota breakdown, and security details
│   │   │   └── TrashPage.jsx           # Trashed documents, restore, and permanent purge
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client with automatic Bearer token interceptor
│   │   │   └── supabase.js             # Browser Supabase client initializer
│   │   ├── utils/
│   │   │   └── formatters.js           # Byte formatting, date formatting, category styles
│   │   ├── App.jsx                     # Root application layout and state manager
│   │   ├── index.css                   # Custom scrollbars, document preview styles
│   │   └── main.jsx                    # React 18 bootstrap
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                     # Vercel SPA routing and caching rules
│   └── vite.config.js                  # Optimized manual chunking for office and UI vendors
├── database/
│   ├── migrations/
│   ├── schema.sql                      # PostgreSQL schema, indexes, RLS policies, and stats function
│   └── storage_setup.sql               # Supabase storage bucket and access policies
├── .env.example                        # Universal environment configuration template
├── .gitignore
├── package.json                        # Root monorepo workspace runner
└── README.md
```

---

## 🗄 Database & Storage Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings -> API**, copy:
   - **Project URL** (`SUPABASE_URL`)
   - **anon / public key** (`SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. Execute SQL Database Schema
Open the **SQL Editor** in your Supabase Dashboard and run the contents of [`database/schema.sql`](database/schema.sql):
- Creates the `documents` table.
- Configures indexes on `user_id`, `category`, `is_trashed`, and `is_favorite`.
- Sets up Row Level Security (RLS) policies isolating documents by `auth.uid() = user_id`.
- Installs the `get_user_document_stats` stored procedure.

### 3. Configure Storage Bucket
In the **SQL Editor**, run the contents of [`database/storage_setup.sql`](database/storage_setup.sql):
- Creates a private bucket named `documents` with a 50 MB file limit.
- Creates storage RLS policies ensuring users can only read, write, or delete files inside their own `userId/` prefix.

---

## ⚙ Environment Variables

Copy the provided [`.env.example`](.env.example) to configure both the backend and frontend:

### Backend Configuration (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development

# Allowed Frontend Origin (for CORS)
FRONTEND_URL=http://localhost:5173

# Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ANON_KEY=your_supabase_anon_public_key_here

# Storage Settings
SUPABASE_STORAGE_BUCKET=documents
MAX_FILE_SIZE_MB=50
USER_STORAGE_QUOTA_MB=500
```

### Frontend Configuration (`frontend/.env`)
```ini
# Supabase Public Keys
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here

# Backend REST API URL
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=DocuVault
```

---

## 💻 Running Locally

### Step 1: Start Backend Server
```bash
cd backend
npm install
npm run dev
```
The backend API will start on `http://localhost:5000`. You can test it by visiting `http://localhost:5000/api/health`.

### Step 2: Start Frontend Application
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

> **Note on Demo Mode**: If you haven't configured Supabase credentials yet, you can click **"Explore Instant Demo Mode"** on the login page to immediately test the full UI, navigation, sorting, preview modal, and upload queues!

---

## 👁 Document Preview Capabilities

| Format | Technology Used | In-Browser Behavior |
| :--- | :--- | :--- |
| **PDF** (`.pdf`) | Embedded canvas/iframe viewer | Full scroll, page navigation, zoom, and download options |
| **Word** (`.docx`) | `mammoth` + `DOMPurify` | Converts document XML structure into sanitized, styled HTML |
| **Excel & CSV** (`.xlsx`, `.xls`, `.csv`) | `xlsx` (SheetJS) | Multi-sheet navigation tabs, styled data grid, row numbering |
| **PowerPoint** (`.pptx`) | Metadata Card + Download | Displays slide metadata and one-click download action |
| **Images** (`.png`, `.jpg`, `.webp`, `.svg`) | Native Zoom Viewer | High-resolution preview with zoom in/out and reset controls |
| **Text & Code** (`.txt`, `.md`, `.json`, etc.) | Syntax Pre-formatter | Formatted code view with monospace typography and line wrapping |

---

## 🔒 Security & Validation

1. **Authentication Check**: Every request to `/api/documents/*` and `/api/user/*` requires an authenticated Supabase JWT.
2. **Row Level Security (RLS)**: Enforced directly in PostgreSQL so one user cannot query or alter another user's rows, even through raw SQL or API tampering.
3. **Magic Byte Signature Inspection**: Server-side inspection (`validateBufferSignature`) inspects binary headers to reject executables (`.exe`, `.dll`, `.elf`, `.bat`) disguised as documents.
4. **Filename Sanitization**: Directory traversal patterns (`../`), null bytes, and illegal OS characters are removed upon upload.
5. **Private Object Storage**: The Supabase bucket is private. Previews and downloads are generated with short-lived (1-hour) signed URLs.
6. **Rate Limiting**: Protects backend endpoints against brute-force attacks and abuse.

---

## 🌐 Step-by-Step Deployment Guide

### 1. Deploying the Frontend on Vercel

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository and select the **`frontend`** directory as the Root Directory.
4. Framework Preset: **Vite**.
5. Add the following **Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g., `https://docuvault-api.onrender.com/api`)
6. Click **Deploy**. Vercel will build and assign an HTTPS URL (e.g., `https://docuvault.vercel.app`).

### 2. Deploying the Backend on Render

1. Log in to [Render](https://render.com) and click **"New +" -> "Web Service"**.
2. Connect your GitHub repository.
3. Set the Root Directory to **`backend`**.
4. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://docuvault.vercel.app`)
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_STORAGE_BUCKET`: `documents`
   - `MAX_FILE_SIZE_MB`: `50`
   - `USER_STORAGE_QUOTA_MB`: `500`
6. Click **Create Web Service**. Render will deploy your Express backend and provide an HTTPS API URL.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
