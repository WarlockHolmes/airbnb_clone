import React from 'react';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import { phraseCaps } from '@utils/utils';
import PropertyEditor from './propertyEditor'
import { BookingsViewer } from './propertyEditor';

class HostWidget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      properties: [],
      loading: true,
      existingBookings: false,
      selected: false,
    }
    this.addProperty = this.addProperty.bind(this)
    this.getUserProperties = this.getUserProperties.bind(this)
    this.startLoading = this.startLoading.bind(this)
    this.passSelected = this.passSelected.bind(this)
    this.scrollRef = React.createRef()
  }

  componentDidMount() {
    this.getUserProperties()
  }

  componentDidUpdate() {
    if (this.state.selected && this.scrollRef.current != null) {
      this.scrollRef.current.scrollIntoView({
        behaviour: 'smooth',
        block: 'start',
      })
    }
  }

  startLoading () {
    this.setState({
      loading: true,
      properties: [],
    })
  }

  getUserProperties(){
    fetch(`/api/properties/user`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          properties: data.properties,
          loading: false,
        })
      })
      .catch(error => {console.log(error)})
  }

  addProperty() {
    let {properties} = this.state;
    let refresh = this.getUserProperties;
    fetch(`/api/properties`, safeCredentials({
      method: 'POST',
      body: JSON.stringify({
        property: {
          title: "Title",
          city: "City",
          country: "us",
          price_per_night: 50,
          property_type: "private room in apartment",
          bedrooms: 0,
          beds: 0,
          baths: 0,
          max_guests: 1,
          description: "Enter your description here",
        }
      })
    })).then(handleErrors)
      .then(data => {
        if (data.success) {
          this.startLoading();
        }
      })
      .then(() => {
        return new Promise(function(resolve, reject) {
                    setTimeout(() => {resolve(refresh());}, 1000)
                });
      })
      .catch((error) => {
        console.log(error);
      })

  }

  getHostBookings = () => {
    fetch(`/api/bookings/host`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          existingBookings: data.bookings,
        })
      }).catch(error => {
        alert('Your properties have no bookings!')
      })
  }

  passSelected(selected) {
    this.setState({ selected: selected })
  }

  render() {
    let {properties, loading, existingBookings, selected} = this.state;
    let bookings = <div className="row justify-content-center align-content-center h-100"><h4 className="text-white-50 text-center font-italic">No bookings!</h4></div>;
    let editors = <div></div>

    if (properties.length !== undefined) {
      editors = properties.map((property) => {
      return <PropertyEditor property={property} loading={this.startLoading} refresh={this.getUserProperties} key={property.id}/>
      })
    }



    const Bottom = () => {
      return (<React.Fragment>{loading ? <p className="mx-auto my-auto text-center text-white fade-cycle">loading...</p> : (properties.length > 0 ?
      <React.Fragment>
        {existingBookings ?
          <div className="mx-auto my-auto fade-in">
            <button className="btn btn-light text-danger fade-in" onClick={() => this.setState({existingBookings: false})}>Return to Properties</button>
          </div>
          :
          <div className="mx-auto fade-in">
            <button className="btn btn-primary mr-2 fade-in" onClick={this.addProperty}>Add <strong>New</strong> Property</button>
            <button className="btn btn-light text-danger ml-2 fade-in" onClick={this.getHostBookings}>See All Bookings</button>
          </div>
        }
      </React.Fragment> :
      <React.Fragment>
        <h3 className="w-100 text-center text-white-50 mt-auto fade-in">You aren't hosting any properties right now!</h3>
        <div className="my-auto mx-auto fade-in">
          <button className="btn btn-light text-danger" onClick={this.addProperty}>Become a <strong>Host!</strong></button>
        </div>
      </React.Fragment>)
    }</React.Fragment>)
    }

    const WidgetTabs = () => {
      return(
      <div className="row justify-content-around">
        <button className="page-tab col-6 btn btn-danger">
          <h4 className="text-center mb-1">Your Properties</h4>
        </button>
        <button className="page-tab col-6 btn-outline-danger" onClick={this.props.toggle}>
          <h4 className="text-center mb-1">Your Trips</h4>
        </button>
      </div>
    )
    }

    return (
      <div className="container py-3">
        <WidgetTabs/>
        <div className="row bg-danger content px-4 py-3">
          <div className={(loading || properties.length == 0) ? "" : (existingBookings ? "bookings-all" : "property-scroll") + " col-12 fade-in" }>
            {!loading && (properties.length > 0 && (existingBookings ?
              <div className="justify-content-around row h-100 align-content-center fade-in">
                <BookingsViewer return={() => {this.setState({existingBookings: false})}} existingBookings={existingBookings} selected={selected} all={true} scrollRef={this.scrollRef} passSelected={this.passSelected} title={false}/>
              </div>
            : editors))}
          </div>
          <Bottom/>
        </div>
      </div>
    );
  }

}

export default HostWidget;
