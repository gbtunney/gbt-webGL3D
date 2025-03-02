import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
//import './script/kal.js'
//import { Sketch}from './script/Sketch.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
/*
document.querySelectorAll("[tlg-kaleidoscope-canvas]").forEach((element) => {
    new Sketch({ dom: element });
});
*/
