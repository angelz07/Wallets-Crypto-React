import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = document.getElementById('root');
const app = createRoot(root);
app.render(<App />);

// Pour mesurer les performances, passez une fonction pour log les résultats
// Par exemple : reportWebVitals(console.log)
reportWebVitals();
