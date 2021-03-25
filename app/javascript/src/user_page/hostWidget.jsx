import React from 'react';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';


class HostWidget extends React.Component {

  state = {
    properties: [],
    total_pages: null,
    next_page: null,
    loading: true,
  }

  componentDidMount() {
    this.fetchUserProperties()
  }

  fetchUserProperties(){
    fetch(`/api/properties/user/${this.props.user}`)
      .then(handleErrors)
      .then(data => {
        console.log(data)
        this.setState({
          properties: data.properties,
          loading: false,
        })
      })
  }

  getPropertyBookings = () => {
    fetch(`/api/properties/${this.props.property_id}/bookings`)
      .then(handleErrors)
      .then(data => {
        console.log(data);
        this.setState({
          existingBookings: data.bookings,
        })
      })
  }

  loadMore = () => {
    if (this.state.next_page === null) {
      return;
    }
    this.setState({ loading: true });
    fetch(`/api/properties?page=${this.state.next_page}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          properties: this.state.properties.concat(data.properties),
          total_pages: data.total_pages,
          next_page: data.next_page,
          loading: false,
        })
      })
  }

  render() {
    const {properties, total_pages, next_page, loading} = this.state;
    return (
      <div className="container pt-1">
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-danger">
            <h4 className="text-center mb-1">Your Properties</h4>
          </button>
          <button className="page-tab col-6 btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Your Stays</h4>
          </button>
        </div>
        <div className="row bg-danger content py-3">
          <div className="col-12 scrollable">
            {properties.map(property => {
              return (
                <div className="mb-4 property row" key={property.id}>
                  <div className="col-12 col-md-4">
                    <img src={property.image_url} className="rounded property-image"/>
                  </div>
                  <div className="col-12 col-md-8">
                    <p className="text-uppercase mb-0 text-secondary"><small><b>{property.city}</b></small></p>
                    <h6 className="mb-0">{property.title}</h6>
                    <p className="mb-0"><small>${property.price_per_night} USD/night</small></p>
                  </div>
                </div>
              )
            })}
            {loading && <p className="d-block mx-auto my-auto text-center text-white">loading...</p>}
          </div>
        </div>
      </div>
    );
  }

}

export default HostWidget;
