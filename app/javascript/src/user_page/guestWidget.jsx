import React from 'react';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import BookingsCalendar from './bookingsCalendar'
import placeholder from '@src/placeholder.png';
import moment from 'moment';

class GuestWidget extends React.Component {
  state = {
    existingBookings: false,
    loading: true,
    selected: false,
  }

  componentDidMount() {
    this.getGuestBookings()
  }


  getGuestBookings() {
    fetch(`/api/bookings/guest`)
      .then(handleErrors)
      .then(data => {
        console.log(data)
        this.setState({
          existingBookings: data.bookings,
          loading: false
        })
      })
  }

  passSelected(selected) {
    this.setState({selected: selected})
  }

  render () {
    let {selected, existingBookings, loading} = this.state;

    let passSelected = this.passSelected.bind(this);

    let {property, start_date, end_date} = selected;

    let days, type_caps, country_caps, id, image_url, title, description, price_per_night, property_type, city, country, baths, bedrooms, beds, max_guests, host, paid;

    if (start_date && end_date) {
      days = moment(end_date).diff(moment(start_date), 'days');
    }

    if (property) {
      type_caps = property.property_type.split(" ").map(word => {
        if (word == 'in') {return word}
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(" ")
      country_caps = property.country.toUpperCase();
      id = property.id
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
      paid = property.paid
    }

    return (
      <div className="container py-3">
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Your Properties</h4>
          </button>
          <button className="page-tab col-6 btn-danger">
            <h4 className="text-center mb-1">Your Trips</h4>
          </button>
        </div>
        <div className="row justify-content-around content bg-danger py-3">
          <div className="my-auto">
            {loading ? <p className="mx-auto my-auto text-center text-white">loading...</p> :
            <React.Fragment>
              <h5 className="text-white text-center mb-3">Select Booking:</h5>
              <div className="mb-5">
                <BookingsCalendar bookings={existingBookings} passSelected={passSelected}/>
              </div>
            </React.Fragment>
            }
          </div>
          {property && <div className="guest-view col-12 col-md-6 my-auto py-3">
            <div className="row justify-content-around">
              <div className=" image-container rounded">
                <img src={image_url} className="property-image"/>
              </div>
            </div>
            <h5 className="font-weight-bold w-100 mx-auto my-2 text-center text-white">{title}</h5>
            <div className="guest-scroll">
                <p className="text-white mb-1 text-center font-italic">{type_caps}</p>
              <div className="col-6 d-inline-block">
                <p className="text-white">
                  Host: <strong>{host}</strong>
                </p>
                <p className="text-white">Arrive: <strong>{new Date(start_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
                <p className="text-white">Total: $<strong>{(price_per_night * days).toLocaleString()}</strong>  (<small className="font-italic">$ {price_per_night}/night</small>)</p>
              </div>
              <div className="col-6 d-inline-block">
                <p className="text-white"><strong>{city}</strong>, {country_caps}</p>
                <p className="text-white">Depart: <strong>{new Date(end_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
                {paid ? <button className="btn btn-light text-primary px-5">Pay Now</button> : <button className="btn btn-light px-5 text-black-50" disabled>Paid</button>}

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
