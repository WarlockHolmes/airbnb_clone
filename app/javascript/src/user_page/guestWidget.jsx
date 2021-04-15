import React from 'react';
import Amenities from '@templates/amenities'
import BookingsCalendar from './bookingsCalendar'
import { ImageViewer } from '@templates/imageViewer';
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

    const load_text = <div className="container h-100">
      <div className="row h-100">
        <p className="d-block mx-auto my-auto text-center text-white fade-cycle">loading...</p>
      </div></div>;

    let calendarClass = "fade-in";

    if (selected) {calendarClass = "slide-left"}

    const WidgetTabs = () => {
      return(
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Your Properties</h4>
          </button>
          <button className="page-tab col-6 btn-danger">
            <h4 className="text-center mb-1">Your Trips</h4>
          </button>
        </div>
      )
    }

    const PropertyViewer = () => {
      return (<React.Fragment>
        {property && <React.Fragment>
        <div className="guest-view d-none d-lg-inline-block col-lg-6 my-auto mr-auto py-3 fade-in">
          <div className="row justify-content-around">
            <ImageViewer images={property.images} image_url={property.image_url}/>
          </div>
          <Amenities property={property} start_date={start_date} end_date={end_date} booking_id={selected.id} paid={selected.paid}/>
        </div>
        <div className="guest-view bg-danger d-lg-none col-11 d-inline-block my-auto py-3">
          <div className="row justify-content-around">
            <ImageViewer images={property.images} image_url={property.image_url}/>
          </div>
          <Amenities property={property} start_date={start_date} end_date={end_date} booking_id={selected.id} paid={selected.paid}/>
        </div>
        <button className="d-block d-lg-none btn btn-danger border-white" onClick={() => {this.setState({selected: false})}}>Return to Calendar</button>
        </React.Fragment>}
      </React.Fragment>)
    }

    return (
      <div className="container py-3 text-white">
        <WidgetTabs/>
        <div className="row justify-content-around content bg-danger py-3">
          <div className="d-none d-lg-block my-auto mx-auto">
            {loading ? load_text :
            <div className={calendarClass}>
              <h5 className="text-center mb-3">Select Booking:</h5>
              <div className="mb-5">
                <BookingsCalendar selected={selected} bookings={existingBookings} passSelected={passSelected}/>
                {existingBookings.length == 0 && <h6 className="mt-3 text-center text-white-50">(You haven't made any bookings yet!)</h6>}
              </div>
            </div>}
          </div>
          {!selected && <div className="d-block d-lg-none my-auto mx-auto">
            {loading ? load_text :
              <div className="fade-in">
                <h5 className="text-center mb-3">Select Booking:</h5>
                <div className="mb-5">
                  <BookingsCalendar bookings={existingBookings} passSelected={passSelected}/>
                </div>
              </div>}
          </div>}
          <PropertyViewer/>
        </div>
      </div>
    );
  }

}

export default GuestWidget;
