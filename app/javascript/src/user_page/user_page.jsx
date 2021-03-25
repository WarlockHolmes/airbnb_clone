// user_page.jsx
import React from 'react';
import {BrowserRouter as Router,Switch,Route,Link} from "react-router-dom";
import { safeCredentials, handleErrors } from '@utils/fetchHelper';
import Layout from "@src/layout";
import GuestWidget from "./guestWidget"
import HostWidget from "./hostWidget"

import './user_page.scss';


const UserContent = (props) => {
  return(
    <React.Fragment>
    { props.host ?
      <HostWidget
        authenticated={props.authenticated}
        toggle={props.toggle}
        email={props.email}
        user={props.user}
      />
      :
      <GuestWidget
        authenticated={props.authenticated}
        toggle={props.toggle}
        email={props.email}
        user={props.user}
      />
    }
    </React.Fragment>
  )
}

class UserPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      authenticated: false,
      host: true,
      user: 'Tommy',
      user_email: 'tommy@test.com',
      loading: true,
    }
    this.toggleService = this.toggleService.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  componentDidMount() {
    this.authenticateUser()
  }

  toggleService() {
    this.setState({ host: !this.state.host })
  }

  authenticateUser() {
    fetch('/api/authenticated')
      .then(handleErrors)
      .then(data => {
        if (!data.authenticated) {window.location.pathname = '/'}
        this.setState({
          authenticated: data.authenticated,
          //user: data.username,
          //user_email: data.email,
          loading: false,
        })
      })
  }

  handleLogOut() {
    fetch(`/api/logout`, safeCredentials({
      method: 'DELETE',
    }))
    .then(handleErrors)
    .then(res => {
      if(res.success){
        this.setState({authenticated: false})
      };
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    const { authenticated, host, user, user_email, loading } = this.state;
    return (
      <React.Fragment>
        <Layout authenticated={authenticated} logout={this.handleLogOut}>
          {!loading ? <UserContent
            host={host}
            authenticated={authenticated}
            toggle={this.toggleService}
            email={user_email}
            user={user}/> : <div className="container"><div className="row content"><h5 className="d-block mx-auto my-auto text-center text-danger">loading...</h5></div></div>}
        </Layout>
      </React.Fragment>
    );
  }
}

export default UserPage;
