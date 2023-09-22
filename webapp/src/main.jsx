import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import Fallback from './components/Fallback'

const logError = (error, info) => {
  // Do something with the error, e.g. log to an external API
  console.log(error.message)
  console.log(info.componentStack)
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary FallbackComponent={Fallback} onError={logError}>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>,
)
