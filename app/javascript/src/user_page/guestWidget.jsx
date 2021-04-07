import React from 'react';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import BookingsCalendar from './bookingsCalendar'
import { phraseCaps } from '@utils/utils';
import placeholder from '@src/placeholder.png';
import moment from 'moment';

class GuestWidget extends React.Component {
  state = {
    existingBookings: false,
    loading: true,
    selected: false,
  }

  initiateStripeCheckout = (booking_id) => {
   return fetch(`/api/charges?booking_id=${booking_id}&cancel_url=${window.location.pathname}`, safeCredentials({
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

    console.log(selected)

    let days, type_caps, country_caps, id, image_url, title, description, price_per_night, property_type, city, country, baths, bedrooms, beds, max_guests, host, parking, enhanced_clean, parties, smoking, pets, laundry, internet, tv, kitchen, hair_dryer, notes, dogs, cats, other, small, hypoallergenic, outdoor, pet_notes;

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
      //paid = property.paid
      parking = property.parking
      enhanced_clean = property.enhanced_clean
      parties = property.parties
      smoking = property.smoking
      pets = property.pets
      laundry = property.laundry
      internet = property.internet
      tv = property.tv
      kitchen = property.kitchen
      hair_dryer = property.hair_dryer
      notes = property.notes

      if (pets !== null) {
        let readPetRules = () => {
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
        let current_pets = readPetRules();
        dogs = current_pets.animals.includes('dogs');
        cats = current_pets.animals.includes('cats');
        other = current_pets.animals.includes('other');
        small = current_pets.rules.includes('small');
        hypoallergenic = current_pets.rules.includes('hypoallergenic');
        outdoor = current_pets.rules.includes('outdoor');
        pet_notes = current_pets.notes;
      }
    }

    const kitchenOptions = (kitchen) => {
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
              <div className=" image-container rounded">
                <img src={image_url} className="property-image"/>
              </div>
            </div>
            <h5 className="font-weight-bold w-100 mx-auto my-2 text-center ">{title}</h5>
            <p className=" mb-1 text-center font-italic">{type_caps}</p>
            <div className="col-6 d-inline-block">
              <p className="">
                Host: <strong>{host}</strong>
              </p>
              <p className="">Arrive: <strong>{new Date(start_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
              <p className="">Total: $<strong>{(price_per_night * days).toLocaleString()}</strong>  (<small className="font-italic">$ {price_per_night}/night</small>)</p>
            </div>
            <div className="col-6 d-inline-block">
              <p className=""><strong>{city}</strong>, {country_caps}</p>
              <p className="">Depart: <strong>{new Date(end_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
              {paid ? <button className="btn btn-light px-5 text-black-50" disabled>Paid</button> : <button className="btn btn-light text-primary px-5" onClick={() => {this.initiateStripeCheckout(selected.id)}}>Pay Now</button> }

            </div>
            <hr/>
            <p className=" px-3">{description}</p>
            <hr/>
            <div className="col-12">
              <p className="col-6 d-inline-block"><i className="fas fa-door-closed"></i> {bedrooms} Bedroom(s)</p>
              <p className="col-6 d-inline-block"><i className="fas fa-bed"></i> {beds} Bed(s)</p>
              <p className="col-6 d-inline-block"><i className="fas fa-bath"></i> {baths} Bath(s)</p>
              {parking !== null && <p className="col-6 d-inline-block"><i className="fas fa-car"></i> {parking ? parking : <strong>No</strong>} Parking Spots</p>}
              {hair_dryer !== null && <p className="col-6 d-inline-block"><i className="fas fa-wind"></i> {!hair_dryer && <strong>No </strong>}Hair Dryer Offered</p>}
              {tv !== null && <p className="col-6 d-inline-block"><i className="fas fa-tv"></i> {!tv && <strong>No </strong>}TV</p>}
              {kitchen !== null && <div className="col-6 d-inline-block"><i className="fas fa-utensils mr-2"></i>
              {kitchenOptions(kitchen)}
              </div>}
              {laundry !== null && <div className="col-6 d-inline-block"><i className="fas fa-tshirt"></i> {phraseCaps(laundry)}</div>}
            </div>
            <hr/>
            <div className="col-12">
              <p className="col-6 d-inline-block">{max_guests} - Guest Maximum</p>
              {enhanced_clean !== null ? <p className="col-6 d-inline-block">*<a href="https://www.airbnb.ca/d/enhancedclean" className="font-weight-bold text-white" target="_blank">Enhanced Clean</a></p> : <p className="col-6 d-inline-block">*<strong>No</strong><a href="https://www.airbnb.ca/d/enhancedclean" className="text-white-50" target="_blank">Enhanced Clean</a></p>}
              {parties !== null && <p className="col-6 d-inline-block">{parties ? <i className="fas fa-users mr-2"></i> : <React.Fragment><i className="fas fa-users-slash mr-2 ban"></i><strong className="ban">No </strong></React.Fragment>}Parties Allowed</p>}
              {smoking !== null && <p className="col-6 d-inline-block">{smoking ? <i className="fas fa-smoking mr-2"></i> : <React.Fragment><i className="fas fa-smoking-ban mr-2 ban"></i><strong className="ban">Non-</strong></React.Fragment>}Smoking</p>}
              {pets !== null &&
              <div className="row pl-3 pets">
                  <p className="col-2 pr-0 d-inline-block"><i className="fas fa-paw"></i> Pets:</p>
                  <div className="col-2 d-inline-block">
                    {dogs && <small>Dogs</small>}
                    {cats && <React.Fragment>, <br/><small>Cats</small></React.Fragment>}
                    {other && <React.Fragment>, <br/><small>Other</small></React.Fragment>}
                  </div>
                  <hr className="vr"/>
                  <div className="col-3 px-0 d-inline-block">
                    {small && <small>Small Pets Only</small>}
                    {hypoallergenic && <React.Fragment>, <br/><small>Hypoallergenic</small></React.Fragment>}
                    {outdoor && <React.Fragment>, <br/><small>Outdoor Only</small></React.Fragment>}
                  </div>
                  <hr className="vr"/>
                  {pet_notes &&
                  <div className="col-4 d-inline-block">
                    <div className="row">
                      <div className="col-3 px-0 d-inline-block"><small className="font-weight-bold">Notes: </small></div>
                      <div className="col-9 pr-0 d-inline-block"><small>{pet_notes}{![".", "!", "?", "..."].includes(pet_notes.slice(-1)) && "."}</small></div>
                    </div>
                  </div>}
              </div>}
            </div>
          </div>}
        </div>
      </div>
    );
  }

}

export default GuestWidget;
