
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Update the document title
document.title = "PersonaAI - AI-Powered Qualitative Research";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(<App />);
