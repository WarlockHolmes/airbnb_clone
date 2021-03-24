// user_page.jsx
import React from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {BrowserRouter as Router,Switch,Route,Link} from "react-router-dom";
import { DayPickerRangeController } from 'react-dates';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';
import Layout from "@src/layout";
import moment from 'moment';


import './user_page.scss';

moment().format();

const Guest = (props) => {
  //<p className="text-secondary mb-3">Explore some of the best-reviewed stays in the world</p>
  return (
    <div className="container pt-4">
      <div className="row justify-content-around">
        <button className="page-tab col-6 btn btn-outline-danger" onClick={props.toggle}>
          <h4 className="text-center mb-1">Your Properties</h4>
        </button>
        <button className="page-tab col-6 btn-danger">
          <h4 className="text-center mb-1">Your Stays</h4>
        </button>
      </div>
      <div className="row justify-content-around content bg-danger py-3">
        <div className="my-auto">
          <DayPickerRangeController
            startDate={props.startDate} // momentPropTypes.momentObj or null,
            endDate={props.endDate} // momentPropTypes.momentObj or null,
            focusedInput={props.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={props.onFocusChange} // PropTypes.func.isRequired,
            initialVisibleMonth={() => moment()} // PropTypes.func or null,
            isDayBlocked={props.isDayBlocked} // block already booked dates
            numberOfMonths={props.numberOfMonths}
          />
        </div>
      </div>
    </div>
  );
}

const Host = (props) => {
  //<p className="text-secondary mb-3">Explore some of the best-reviewed stays in the world</p>
  return (
    <div className="container pt-4">
      <div className="row justify-content-around">
        <button className="page-tab col-6 btn btn-danger">
          <h4 className="text-center mb-1">Your Properties</h4>
        </button>
        <button className="page-tab col-6 btn-outline-danger" onClick={props.toggle}>
          <h4 className="text-center mb-1">Your Stays</h4>
        </button>
      </div>
      <div className="row bg-danger content py-3">
        {props.properties.map(property => {
          return (
            <div key={property.id} className="col-6 col-lg-4 mb-4 property">
              <a href={`/property/${property.id}`} className="text-body text-decoration-none">
                <div className="property-image mb-1 rounded" style={{ backgroundImage: `url(${property.image_url})` }} />
                <p className="text-uppercase mb-0 text-secondary"><small><b>{property.city}</b></small></p>
                <h6 className="mb-0">{property.title}</h6>
                <p className="mb-0"><small>${property.price_per_night} USD/night</small></p>
              </a>
            </div>
          )
        })}
      </div>
      {props.loading && <p>loading...</p>}
      {(props.loading || props.next_page === null) ||
        <div className="text-center user-bottom bg-danger">
          <button
            className="btn btn-light mb-4"
            onClick={props.more}
          >load more</button>
        </div>
      }
    </div>
  );
}

class UserPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      authenticated: false,
      host: true,
      properties: [],
      total_pages: null,
      next_page: null,
      loading: false,
      existingBookings: [],
      startDate: null,
      endDate: null,
      focusedInput: null,
      numberOfMonths: 3,
      error: false,
    }
    this.fetchProperties = this.fetchProperties.bind(this);
    this.toggleService = this.toggleService.bind(this);
    this.checkAuthenticated = this.checkAuthenticated.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.getPropertyBookings = this.getPropertyBookings.bind(this);
    this.isDayBlocked = this.isDayBlocked.bind(this);
  }

  componentDidMount() {
    this.checkAuthenticated()
    if (this.state.host) {this.fetchProperties()}
  }

  fetchProperties(){
    fetch('/api/properties?page=1')
      .then(handleErrors)
      .then(data => {
        this.setState({
          properties: data.properties,
          total_pages: data.total_pages,
          next_page: data.next_page,
          loading: false,
        })
      })
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

  getPropertyBookings() {
    fetch(`/api/properties/${this.props.property_id}/bookings`)
      .then(handleErrors)
      .then(data => {
        console.log(data);
        this.setState({
          existingBookings: data.bookings,
        })
      })
  }

  isDayBlocked = day => this.state.existingBookings.filter(b => day.isBetween(b.start_date, b.end_date, null, '[)')).length > 0

  render() {
    const { authenticated, host, properties, next_page, loading, existingBookings, startDate, endDate, focusedInput, numberOfMonths } = this.state;
    return (
      <React.Fragment>
        <Layout authenticated={authenticated} logout={this.handleLogOut}>
          { host ?
            <Host
              authenticated={authenticated}
              loading={loading}
              properties={properties}
              next_page={next_page}
              toggle={this.toggleService}
            />
            :
            <Guest
              authenticated={authenticated}
              loading={loading}
              toggle={this.toggleService}
              existingBookings={existingBookings}
              startDate={startDate}
              endDate={endDate}
              focusedInput={focusedInput}
              onFocusChange={(focusedInput) => this.setState({ focusedInput })}
              isDayBlocked={this.isDayBlocked} // block already booked dates
              numberOfMonths={numberOfMonths}
            />
          }
        </Layout>
      </React.Fragment>
    );
  }
}

export default UserPage;
