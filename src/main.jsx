import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
} else {
  const root = ReactDOM.createRoot(rootElement)
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (err) {
    rootElement.innerHTML = `<div style="padding: 20px; color: white;"><h1>Oops! Something went wrong.</h1><pre>${err.message}</pre></div>`
  }
}
