// index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import UserPage from './user_page';


document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <UserPage />,
    document.body.appendChild(document.createElement('div')),
  )
})
