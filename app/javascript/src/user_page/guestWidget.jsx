import React from 'react';
import Amenities from '@src/templates/amenities'
import BookingsCalendar from './bookingsCalendar'

import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import placeholder from '@utils/placeholder.png';

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

    let {property, start_date, end_date, paid} = selected;

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
            {loading ? <p className="mx-auto my-auto text-white text-center ">loading...</p> :
            <React.Fragment>
              <h5 className="text-white text-center mb-3">Select Booking:</h5>
              <div className="mb-5">
                <BookingsCalendar bookings={existingBookings} passSelected={passSelected}/>
              </div>
            </React.Fragment>
            }
          </div>
          {property && <div className="guest-view text-white col-12 col-md-6 my-auto py-3">
            <div className="row justify-content-around">
              <div className="mb-2 image-container rounded">
                <img src={property.image_url} className="property-image"/>
              </div>
            </div>
            <Amenities property={property} start_date={start_date} end_date={end_date} booking_id={selected.id}/>
          </div>}
        </div>
      </div>
    );
  }

}

export default GuestWidget;
