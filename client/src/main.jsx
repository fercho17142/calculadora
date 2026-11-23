import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { BetProvider } from './context/BetContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BetProvider>
        <App />
      </BetProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
