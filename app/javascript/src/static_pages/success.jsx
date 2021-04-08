import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/templates/layout';
import Amenities from '@src/templates/amenities';
import { handleErrors, safeCredentials } from '@utils/fetchHelper';
import { random } from '@utils/utils';
import './success.scss';

const map_key = process.env.MAP_KEY;

class SuccessPage extends React.Component {

  state = {
    loading: true,
    authenticated: false,
    booking: {},
    property: {},
    point_of_interest: null,
  }

  getPOI = (method, query) => {
      return new Promise(function(resolve, reject) {
        var url =
          "https://api.opentripmap.com/0.1/en/places/" +
          method +
          "?apikey=" +
          map_key;
        if (query !== undefined) {
          url += "&" + query;
        }
        fetch(url)
          .then(response => response.json())
          .then(data => resolve(data))
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      });
    }

  componentDidMount() {
    let lon; // place longitude
    let lat; // place latitude
    fetch('/api/authenticated')
      .then(handleErrors)
      .then(data => {
        this.setState({
          authenticated: data.authenticated
        })
      }).catch((error) => {
        window.location.pathname = '/'
      })

    fetch(`/api/bookings/${this.props.booking_id}`)
      .then(handleErrors)
      .then(res => {
        this.setState({
          booking: res.booking,
          property: res.booking.property,
        })
        this.getPOI("geoname", "name=" + res.booking.property.city)
        .then(data => {
          if (data.status == "OK") {
            lon = data.lon;
            lat = data.lat;
            this.getPOI("radius",`radius=10000&limit=10&kinds=squares,museums,theatres_and_entertainments&lon=${lon}&lat=${lat}&rate=3&format=json`).then(data => {
              if (data.length > 0) {
                let xid = data[random(data.length)].xid;
                this.getPOI(`xid/${xid}`).then(data => {
                  this.setState({
                    point_of_interest: data,
                    loading: false,
                  })
                })
              }
            })
          }
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
        window.location.pathname = '/'
      };
    }).catch((error) => {
      console.log(error);
    })
  }

  render(){
    const {booking_id} = this.props;
    const {booking, property, loading, authenticated, point_of_interest} = this.state;

    return (
      <Layout authenticated={authenticated} logout={this.handleLogOut}>
        <div id="background-container">
          {!loading &&
          <div className="image-container">
            <div className="image-div" style={{backgroundImage: ` url(${property.image_url})`}}></div>
          </div>}
          <div className="container h-100">
            <div className="row h-100 justify-content-center align-content-center">
              {!loading ? (authenticated &&
              <div className="content mh-100 row justify-content-around col-12 col-lg-11 mx-auto">
                <h1 className="mx-auto row w-100 justify-content-center font-weight-bold mb-4">You're All Set!</h1>
                <div className="content-main row justify-content-around align-content-top">
                  <div className="col-12 col-md-5 h-100 d-inline-block">
                      <h5 className="text-center w-100 font-italic">Booking #{booking_id} has been made.</h5>
                    <hr/>
                    <div className="my-auto point_of_interest">
                      {point_of_interest != null && <div className="text-center">
                        <p className="w-100 link-text-muted mb-1">While you're visiting, why not check out...</p>
                        <h6 className="mb-3"><b><a className="text-white" href={point_of_interest.wikipedia} target="_blank">{point_of_interest.name}</a></b></h6>
                        <div className="row justify-content-center align-content-center">
                          <div className="image-container">
                            <img src={point_of_interest.preview.source}/>
                          </div>
                        </div>
                      </div>}
                    </div>
                  </div>
                  <div className="d-none col-md-7 d-md-inline-block info">
                    <Amenities property={property} start_date={booking.start_date} end_date={booking.end_date} booking_id={booking_id}/>
                  </div>
                  <div className="d-inline-block col-12 d-md-none">
                    <Amenities property={property} start_date={booking.start_date} end_date={booking.end_date} booking_id={booking_id}/>
                  </div>
                </div>
              </div>) : <p className="text-center text-danger">loading...</p>}
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('params');
  const data = JSON.parse(node.getAttribute('data-params'));

  ReactDOM.render(
    <SuccessPage booking_id={data.booking_id}/>,
    document.body.appendChild(document.createElement('div')),
  )
})
