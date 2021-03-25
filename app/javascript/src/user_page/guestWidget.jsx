import React from 'react';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';
import { DayPickerRangeController } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment';

moment().format();

class GuestWidget extends React.Component {

  state = {
    startDate: null,
    endDate: null,
    focusedInput: null,
    numberOfMonths: 3,
    existingBookings: [],
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

  onDatesChange = ({ startDate, endDate }) => this.setState({ startDate, endDate })

  onFocusChange = (focusedInput) => this.setState({ focusedInput })

  isDayBlocked = day => this.state.existingBookings.filter(b => day.isBetween(b.start_date, b.end_date, null, '[)')).length > 0


  render () {
    const {startDate, endDate, focusedInput, onFocusChange, isDayBlocked, numberOfMonths } = this.state;
    return (
      <div className="container pt-4">
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Your Properties</h4>
          </button>
          <button className="page-tab col-6 btn-danger">
            <h4 className="text-center mb-1">Your Stays</h4>
          </button>
        </div>
        <div className="row justify-content-around content bg-danger py-3">
          <div className="my-auto">
            <DayPickerRangeController
              startDate={startDate} // momentPropTypes.momentObj or null,
              endDate={endDate} // momentPropTypes.momentObj or null,
              onDatesChange={this.onDatesChange}
              focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={this.onFocusChange} // PropTypes.func.isRequired,
              initialVisibleMonth={() => moment()} // PropTypes.func or null,
              isDayBlocked={this.isDayBlocked} // block already booked dates
              numberOfMonths={numberOfMonths}
            />
          </div>
        </div>
      </div>
    );
  }

}

export default GuestWidget;
