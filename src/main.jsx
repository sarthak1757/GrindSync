import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { QuestionProvider } from './context/QuestionContext'
import { GroupProvider } from './context/GroupContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QuestionProvider>
          <GroupProvider>
            <App />
          </GroupProvider>
        </QuestionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
