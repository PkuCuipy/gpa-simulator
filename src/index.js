import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from "./App.js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  /* 不注释会导致在 dev 时 App 每次都 Mount 两次. (参考: https://stackoverflow.com/a/62237101) */
  // <React.StrictMode>
    <App/>
  // </React.StrictMode>
);
