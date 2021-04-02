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
      />
      :
      <GuestWidget
        authenticated={props.authenticated}
        toggle={props.toggle}
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
      loading: true,
    }
    this.toggleService = this.toggleService.bind(this);
    this.checkAuthenticated = this.checkAuthenticated.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  componentDidMount() {
    this.checkAuthenticated()
  }

  toggleService() {
    this.setState({ host: !this.state.host })
  }

  checkAuthenticated() {
    fetch('/api/authenticated')
      .then(handleErrors)
      .then(data => {
        this.setState({
          authenticated: data.authenticated,
          loading: false,
        })
      }).catch((error) => {
        window.location.pathname = '/'
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
        {window.location.pathname = '/'}
      };
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    const { authenticated, host, user, loading } = this.state;
    return (
      <React.Fragment>
        <Layout authenticated={authenticated} logout={this.handleLogOut}>
          {!loading ? <UserContent
            host={host}
            authenticated={authenticated}
            toggle={this.toggleService}
            /> :
            <div className="container">
              <div className="row content">
                <h5 className="d-block mx-auto my-auto text-center text-danger">loading...</h5>
              </div>
            </div>}
        </Layout>
      </React.Fragment>
    );
  }
}

export default UserPage;
