import '@carbon/styles/css/styles.css';     // ← ✅ Carbon global CSS
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);