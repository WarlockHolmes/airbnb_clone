import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/layout';
import { handleErrors, safeCredentials } from '@utils/fetchHelper';
import { phraseCaps, random} from '@utils/utils';
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


  apiGet = (method, query) => {
      return new Promise(function(resolve, reject) {
        var otmAPI =
          "https://api.opentripmap.com/0.1/en/places/" +
          method +
          "?apikey=" +
          map_key;
        if (query !== undefined) {
          otmAPI += "&" + query;
        }
        fetch(otmAPI)
          .then(response => response.json())
          .then(data => resolve(data))
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      });
    }

  initiateStripeCheckout = (booking_id) => {
   return fetch(`/api/charges?booking_id=${booking_id}&cancel_url=/`, safeCredentials({
     method: 'POST',
   }))
     .then(handleErrors)
     .then(response => {
       const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);

       stripe.redirectToCheckout({
         // Make the id field from the Checkout Session creation API response
         // available to this file, so you can provide it as parameter here
         // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
         sessionId: response.charge.checkout_session_id,
       }).then((result) => {
         // If `redirectToCheckout` fails due to a browser or network
         // error, display the localized error message to your customer
         // using `result.error.message`.

       });
     })
     .catch(error => {
       console.log(error);
     })
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
        console.log(error)
        //window.location.pathname = '/'
      })

    fetch(`/api/bookings/${this.props.booking_id}`)
      .then(handleErrors)
      .then(res => {
        this.setState({
          booking: res.booking,
          property: res.booking.property,
        })
        this.apiGet("geoname", "name=" + res.booking.property.city)
        .then(data => {
            if (data.status == "OK") {
              lon = data.lon;
              lat = data.lat;
              this.apiGet("radius",`radius=1000&limit=10&kinds=squares,museums,theatres_and_entertainments&lon=${lon}&lat=${lat}&rate=3&format=json`).then(data => {
                if (data.status == "OK") {
                  let xid = data[random(data.length)].xid;
                  this.apiGet(`xid/${xid}`).then(data => {
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

  readPetRules(pets) {

    let animals = []
    let rules = []
    let notes;
    let sections = pets.split(';')
    sections.pop()
    sections.forEach((v, i) => {
      if (v) {
        switch(i) {
          case 0: animals = v.split(','); break;
          case 1: rules = v.split(','); break;
          case 2: notes = v; break;
        }
      }
    })

    return {
      animals: animals.map(v => {return v}),
      rules: rules.map(v => {return v}),
      notes: notes,
    }

  }

  render(){
    const {booking_id} = this.props;
    const {booking, property, loading, authenticated, point_of_interest} = this.state;
    const {start_date, end_date, paid} = booking;
    const {host, title, image_url, description, price_per_night, property_type, city, country, baths, bedrooms, beds, max_guests, parking, enhanced_clean, parties, smoking, pets, laundry, internet, tv, kitchen, hair_dryer, notes} = property;

    let dogs, cats, other, small, hypoallergenic, outdoor, pet_notes;

    if (pets !== undefined && pets !== null) {
      let current_pets = this.readPetRules(pets);
      dogs = current_pets.animals.includes('dogs');
      cats = current_pets.animals.includes('cats');
      other = current_pets.animals.includes('other');
      small = current_pets.rules.includes('small');
      hypoallergenic = current_pets.rules.includes('hypoallergenic');
      outdoor = current_pets.rules.includes('outdoor');
      pet_notes = current_pets.notes;
    }

    const kitchenOptions = () => {
      let options = [];
      if (kitchen != "none") {
        if (kitchen == "kitchen" || kitchen == "no stove" || kitchen == "no fridge" || kitchen == "oven only") {
          options.push("Oven")
        }
        if (kitchen == "kitchen" || kitchen == "no oven" || kitchen == "no fridge" || kitchen == "stove only") {
          options.push("Stove")
        }
        if (kitchen == "kitchen" || kitchen == "no stove" || kitchen == "no fridge" || kitchen == "oven only") {
          options.push("Oven")
        }
        if (kitchen == "kitchen" || kitchen == "no oven" || kitchen == "no stove" || kitchen == "fridge only") {
          options.push("Refrigerator")
        }
        return options.join(', ');
      } else {return "No Kitchen Available"}

    }

    return (
      <Layout authenticated={authenticated} logout={this.handleLogOut}>
        <div id="background-container">
          <div className="image-container">
            <div className="image-div" style={{backgroundImage: ` url(${image_url})`}}></div>
          </div>
          <div className="container">
            <div className="row">
              <div className="content row col-12 col-md-10 mx-auto my-4">
                {!loading ? (authenticated && <React.Fragment>
                  <h1 className="row w-100 justify-content-center font-weight-bold mb-3">You're All Set!</h1>
                  <div className="col-12 col-md-6 h-100 d-inline-block">
                    <div className="row col-12 mx-0 w-100 justify-content-around">
                      <p className="text-center w-100">Booking #{booking_id} has been successfully made.</p>
                      {paid ? <button className="btn btn-light px-5 text-black-50" disabled>Paid</button> : <button className="mx-auto my-auto btn btn-light text-primary px-5" onClick={() => {this.initiateStripeCheckout(booking_id)}}>Pay Now</button>}
                    </div>
                    <hr/>
                    <div className="my-auto point_of_interest">
                      {point_of_interest != null && <div>
                        <p className="w-100 text-center mb-2 ">While you're visiting, why not check out...<br/><b><a className="text-white" href={point_of_interest.wikipedia} target="_blank">{point_of_interest.name}</a></b></p>
                        <div className="image-container">
                          <img src={point_of_interest.preview.source}/>
                        </div>
                      </div>}
                    </div>
                  </div>
                  <div className="col-12 col-md-6 d-inline-block guest-view">
                    <div className="mb-3" >
                      <h5 className="mb-0">{title}</h5>
                      <p className="text-uppercase mb-0 text-white-50"><small>{city}, {country}</small></p>
                      <p className="mb-0"><small>Hosted by <b>{host}</b></small></p>
                      <p className="mb-0 font-italic">{phraseCaps(property_type)}</p>
                    </div>
                    <hr />
                    <p>{description}</p>
                    <hr/>
                    <div className="row pl-3 align-content-between">
                      <p className="col-6 d-inline-block"><i className="fas fa-door-closed"></i> {bedrooms} Bedroom(s)</p>
                      <p className="col-6 d-inline-block"><i className="fas fa-bed"></i> {beds} Bed(s)</p>
                      <p className="col-6 d-inline-block"><i className="fas fa-bath"></i> {baths} Bath(s)</p>
                      {parking !== null && <p className="col-6 d-inline-block"><i className="fas fa-car"></i> {parking ? parking : <strong>No</strong>} Parking Spots</p>}
                      {hair_dryer !== null && <p className="col-6 d-inline-block"><i className="fas fa-wind"></i> {!hair_dryer && <strong>No </strong>}Hair Dryer Offered</p>}
                      {tv !== null && <p className="col-6 d-inline-block"><i className="fas fa-tv"></i> {!tv && <strong>No </strong>}TV</p>}
                      {kitchen !== null && <div className="col-6 d-inline-block"><i className="fas fa-utensils mr-2"></i>
                      {kitchenOptions()}
                      </div>}
                      {laundry !== null && <div className="col-6 d-inline-block"><i className="fas fa-tshirt"></i> {phraseCaps(laundry)}</div>}
                    </div>
                    <hr/>
                    <div className="row pl-3 align-content-between">
                    <p className="col-6 d-inline-block">{max_guests} - Guest Maximum</p>
                    {enhanced_clean !== null ? <p className="col-6 d-inline-block">*<a href="https://www.airbnb.ca/d/enhancedclean" className="font-weight-bold text-white" target="_blank">Enhanced Clean</a></p> :  <p className="col-6 d-inline-block">*<a href="https://www.airbnb.ca/d/enhancedclean" className="text-white" target="_blank"><strong>No</strong> Enhanced Clean</a></p>}
                    {parties !== null && <p className="col-6 d-inline-block">{parties ? <i className="fas fa-users mr-2"></i> : <React.Fragment><i className="fas fa-users-slash mr-2 ban"></i><strong className="ban">No </strong></React.Fragment>}Parties {parties && 'Allowed'}</p>}
                    {smoking !== null && <p className="col-6 d-inline-block">{smoking ? <i className="fas fa-smoking mr-2"></i> : <React.Fragment><i className="fas fa-smoking-ban mr-2 ban"></i><strong className="ban">Non</strong>-</React.Fragment>}Smoking</p>}
                    {pets !== null &&
                    <div className="row pets mb-3 pl-3">
                      <p className="col-2 pr-0 d-inline-block"><i className="fas fa-paw" ></i>:</p>
                      <div className="col-1 px-0 d-inline-block">
                        {dogs && <small>Dogs</small>}
                        {cats && <React.Fragment>, <br/><small>Cats</small></React.Fragment>}
                        {other && <React.Fragment>, <br/><small>Other</small></React.Fragment>}
                      </div>
                      <hr className="vr"/>
                      <div className="col-3 px-0 d-inline-block">
                        {small && <small>Small Only</small>}
                        {hypoallergenic && <React.Fragment>, <br/><small>Hypoallergenic</small></React.Fragment>}
                        {outdoor && <React.Fragment>, <br/><small>Outdoor Only</small></React.Fragment>}
                      </div>
                      <hr className="vr"/>
                      {pet_notes &&
                      <div className="col-5 d-inline-block">
                        <div className="row">
                          <div className="col-3 px-0 d-inline-block"><small className="font-weight-bold">Notes: </small></div>
                          <div className="col-9 pr-0 d-inline-block pet-scroll"><small>{pet_notes}{![".", "!", "?", "..."].includes(pet_notes.slice(-1)) && "."}</small></div>
                        </div>
                      </div>}
                    </div>}
                  </div>
                </div>
                </React.Fragment>) : <p className="mx-auto my-auto text-center text-white">loading...</p>}
              </div>
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
