# Padel Zapisvachka

A modern web application for managing padel court bookings, built with React, TypeScript, and Firebase Firestore. Streamline your padel court reservations with real-time updates and a beautiful user interface.

## 🚀 Features

- **Real-time Database**: Powered by Firebase Firestore
- **Beautiful UI**: Modern design with smooth animations and micro-interactions
- **Full CRUD Operations**: Create, read, update, and delete bookings
- **Responsive Design**: Works perfectly on all devices
- **Error Handling**: Comprehensive error handling and loading states
- **TypeScript**: Fully typed for better development experience

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project with Firestore enabled
- Git (for cloning)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd padel-zapisvachka
npm install
```

### 2. Firebase Configuration

1. **Create a Firebase Project**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Firestore**:

   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (you can configure security rules later)
   - Select a location for your database

3. **Get Firebase Configuration**:

   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Web" icon to create a web app
   - Register your app and copy the configuration

4. **Set Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 to view the app.

## 🚀 Deployment to Vercel

The project is configured for easy deployment on Vercel with the following setup:

1. **Automatic Deployment**:

   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect the Vite configuration

2. **Environment Variables**:

   - Add your Firebase configuration as environment variables in the Vercel dashboard:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

3. **Build Settings**:
   The project includes a `vercel.json` configuration file with the following settings:
   ```json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "vite",
     "outputDirectory": "dist"
   }
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── services/           # API layer
├── types/              # TypeScript type definitions
├── firebase.ts         # Firebase configuration
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## 🔒 Security Considerations

For production use, configure Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

