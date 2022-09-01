import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './assests/css/style.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import {MoralisProvider} from 'react-moralis';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  // <MoralisProvider appId="Lm3giliYTTGlL5S9broqn3witYEWXt6wmjPfROzR" serverUrl="https://cnohtupnw4bs.usemoralis.com:2053/server">
    <App />
  // </MoralisProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
