import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './assets/css/common.css';
import App from './App';
import 'core-js/stable';//babel
import 'regenerator-runtime/runtime';//babel
import 'react-app-polyfill/ie9';//polyfill
import 'react-app-polyfill/stable';//polyfill
import './translation/i18n'; // 다국어
// import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);

// reportWebVitals();
