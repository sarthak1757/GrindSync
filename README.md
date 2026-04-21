# GrindSync

GrindSync is a comprehensive DSA (Data Structures and Algorithms) tracking web application designed to help software engineers systematically improve their coding skills on platforms like LeetCode and Codeforces.

## 🚀 Core Features

- **Spaced Repetition System (SRS)**: Say goodbye to manually organizing your practice schedule. GrindSync employs a mathematically driven revision algorithm to strictly manage your queue. It analyzes the specific question difficulty, your historical time-to-solve, and your confidence ratings to intelligently surface the exact questions you need to re-practice, right when you're about to forget them.
- **Automated Tracking via Extension**: When paired with the [GrindSync Chrome Extension](https://github.com/sarthak1757/GrindSync-Extension), the app automatically intercepts and logs your successful submissions directly from LeetCode and Codeforces without you leaving the tab.
- **Dynamic Profile Analytics**: Visualizes your DSA progress natively through a sophisticated dashboard featuring GitHub-style solve heatmaps, topic mastery pie charts, and 30-day performance trend graphs.
- **Multiplayer Challenges & Groups**: Create groups or challenge your friends directly to timed coding battles with live tracking.
- **AI Mentorship**: Equipped with a generative AI assistant configured to provide architectural guidance and hints when you get completely stuck on a LeetCode problem.

## 🛠 Technologies

- **Core**: React.js, Context API
- **Design & UI**: Tailwind CSS, Recharts (Data Visualization), Lucide React (Icons), React Hot Toast (Notifications)
- **Backend & Database**: Firebase Authentication, Firebase Cloud Firestore
- **AI Integration**: Google Gemini API

## 📥 Local Setup & Installation

1. Clone the repository.
2. Install the necessary dependencies via npm:
   ```bash
   npm install
   ```
3. Set up your environment variables. Duplicate the `.env.example` file, rename it to `.env`, and populate it entirely with your Firebase project configuration keys and your Gemini API key:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_key
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```

## 🔌 Companion Extension

To unlock the automated tracking features, you must install the **GrindSync Tracker Chrome Extension**. 
You can log directly into the extension's popup interface using the same Email and Password credentials you create here on the web application.
