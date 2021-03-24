// layout.js
import React from 'react';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';
import './layout.scss';

const Layout = (props) => {
  return (
    <React.Fragment>
      <nav className="navbar navbar-expand navbar-light bg-light w-100">
        <a href="/"><span className="navbar-brand mb-0 h1 text-danger">Airbnb</span></a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/">Home</a>
            </li>
            <li className="nav-item">
              {props.authenticated ? <a className="nav-link" href="/user_page">My Bookings</a> : <a className="nav-link" href={`/login?redirect_url=${window.location.pathname}`}>Log in</a>}
            </li>
          </ul>
          <ul className="navbar-nav ml-auto">
            {props.authenticated && <li className="nav-item"><a className="nav-link text-danger" id="logout" href="" onClick={props.logout}>Log out</a></li>}
          </ul>
        </div>
      </nav>
      {props.children}
      <footer className="p-3 bg-light">
        <div>
          <p className="mr-3 mb-0 text-secondary">Airbnb Clone</p>
        </div>
      </footer>
    </React.Fragment>
  );

}

export default Layout;
