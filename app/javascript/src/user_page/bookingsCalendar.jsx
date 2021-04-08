import React from 'react';
import { DayPickerSingleDateController } from 'react-dates';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment';

class BookingsCalendar extends React.Component {

  state = {
      selected: false,
      date: moment(),
      focused: true,
    }

  readBookings(date) {
    let {bookings} = this.props
    let selected;

    bookings.forEach(booking => {
      if (date.isBetween(booking.start_date, moment(booking.end_date).add(1, 'days'))) {
        selected = booking
      }
    });
    if (selected) {
      this.setState({selected: selected})
      if(this.props.passSelected != undefined) {
        this.props.passSelected(selected)
      }
    }
    else {this.setState({selected: false})}
  }

  onDateChange = (date) => {
    this.setState({ date });
    this.readBookings(date)
  }

  onFocusChange = () => {
    // Force the focused states to always be truthy so that date is always selectable
    this.setState({ focused: true });
  }

  isDayHighlighted = day => this.props.bookings.filter(b =>  day.isBetween(b.start_date, moment(b.end_date).add(1, 'days'), null, '[]')).length > 0

  render() {
    let {date, focused} = this.state;

    return (
      <React.Fragment>
        <DayPickerSingleDateController
          onDateChange={this.onDateChange}
          focused={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
          date={date}
          onFocusChange={this.onFocusChange} // PropTypes.func.isRequired,
          isDayHighlighted={this.isDayHighlighted} // highlight bookings
          isOutsideRange={day => day.isBefore(moment().startOf('day'))}
        />
      </React.Fragment>
    )
  }

}

export default BookingsCalendar
