// Self-healing check for corrupted localStorage values
['user', 'token', 'lang', 'theme'].forEach(key => {
  const val = localStorage.getItem(key);
  if (val === 'undefined' || val === 'null') {
    localStorage.removeItem(key);
  }
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
