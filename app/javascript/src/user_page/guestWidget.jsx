import React from 'react';
import 'react-dates/initialize';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';
import { DayPickerRangeController, DateRangePicker, DayPickerSingleDateController } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import placeholder from '@src/placeholder.png';
import moment from 'moment';

moment().format();

class GuestWidget extends React.Component {
  state = {
    selected: false,
    date: moment(),
    focused: true,
    numberOfMonths: 2,
    existingBookings: false,
    loading: true,
  }

  componentDidMount() {
    this.getUserBookings()
  }

  readBookings(date) {
    let {existingBookings} = this.state;
    let selected;

    existingBookings.forEach(booking => {
      if (date.isBetween(booking.start_date, booking.end_date)) {
        selected = booking
      }
    });
    if (selected) {this.setState({selected: selected})}
    else {this.setState({selected: false})}
  }

  getUserBookings() {
    fetch(`/api/bookings/user`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          existingBookings: data.bookings,
          loading: false
        })
      })
  }

  onDateChange = (date) => {
    this.setState({ date });
    this.readBookings(date)
  }

  onFocusChange = () => {
    // Force the focused states to always be truthy so that date is always selectable
    this.setState({ focused: true });
  }

  /*






  */

  isDayHighlighted = day => this.state.existingBookings.filter(b => day.isBetween(b.start_date, b.end_date, null, '[)')).length > 0



  render () {
    let {selected, existingBookings, date, focused, numberOfMonths, loading, portal} = this.state;

    let {property, start_date, end_date} = selected;

    let days, type_caps, country_caps, id, image_url, title, description, price_per_night, property_type, city, country, baths, bedrooms, beds, max_guests, host;

    if (start_date && end_date) {
      days = moment(end_date).diff(moment(start_date), 'days');
    }

    if (property) {
      type_caps = property.property_type.split(" ").map(word => {
        if (word == 'in') {return word}
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(" ")
      country_caps = property.country.toUpperCase();
      id = property.id,
      image_url = property.image_url
      title = property.title
      description = property.description
      price_per_night = property.price_per_night
      property_type = property.property_type
      city = property.city
      country = property.country
      baths = property.baths
      bedrooms = property.bedrooms
      beds = property.beds
      max_guests = property.max_guests
      host = property.host
    }

    return (
      <div className="container py-3">
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Properties</h4>
          </button>
          <button className="page-tab col-6 btn-danger">
            <h4 className="text-center mb-1">Bookings</h4>
          </button>
        </div>
        <div className="row justify-content-around content bg-danger py-3">
          <div className="my-auto">
            {loading ? <p className="mx-auto my-auto text-center text-white">loading...</p> :
            <React.Fragment>
            <h5 className="text-white text-center mb-4">Select Booking:</h5>
            <DayPickerSingleDateController
              onDateChange={this.onDateChange}
              focused={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              date={date}
              onFocusChange={this.onFocusChange} // PropTypes.func.isRequired,
              isDayHighlighted={this.isDayHighlighted} // block already booked dates
              isOutsideRange={day => day.isBefore(moment().startOf('day'))}
            />
            </React.Fragment>
            }
          </div>
          {property && <div className="guest-view col-12 col-md-6 my-auto py-3">
            <div className="row justify-content-around image-container">
              <img src={image_url} className="property-image rounded"/>
            </div>
            <h5 className="font-weight-bold w-100 mx-auto my-2 text-center text-white">{title}</h5>
            <div className="guest-scroll">
                <p className="text-white mb-1 text-center font-italic">{type_caps}</p>
              <div className="col-6 d-inline-block">
                <p className="text-white">
                  Host: <strong>{host}</strong>
                </p>
                <p className="text-white">Arrive: <strong>{new Date(start_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
                <p className="text-white text-center">Total: $<strong>{(price_per_night * days).toLocaleString()}</strong>  (<small className="font-italic">$ {price_per_night} {country_caps}D / night</small>)</p>
              </div>
              <div className="col-6 d-inline-block">
                <p className="text-white"><strong>{city}</strong>, {country_caps}</p>
                <p className="text-white">Depart: <strong>{new Date(end_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
                <button className="btn btn-light text-primary ml-5">Pay Now</button>
              </div>
              <hr/>
              <p className="text-white px-3">{description}</p>
              <hr/>
              <div className="col-6 d-inline-block">
                <p className="text-white">Baths: {baths}</p>
                <p className="text-white">Bedrooms: {bedrooms}</p>
              </div>
              <div className="col-6 d-inline-block">
                <p className="text-white">Beds: {beds}</p>
                <p className="text-white">Max Guests: {max_guests}</p>
              </div>
            </div>
          </div>}

        </div>
      </div>
    );
  }

}

export default GuestWidget;
