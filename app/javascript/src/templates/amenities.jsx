import React from 'react';
import { phraseCaps } from '@utils/utils';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import moment from 'moment';

class Pets extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bottom: false,
      scrollable: false,
    }
    this.petScrollRef = React.createRef();
  }


  componentDidMount() {
    let element = this.petScrollRef.current

    if (element != null) {
      const hasScrollableContent = element.scrollHeight > element.clientHeight;

      const overflowYStyle = window.getComputedStyle(element).overflowY;
      const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

      if (hasScrollableContent && !isOverflowHidden) {
        this.setState({scrollable: true})
      };
    }

  }

  handleScroll = () => {
    let element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.setState({bottom: true})
    } else {
      if (this.state.bottom) {this.setState({bottom: false})}
    }
  }

  render() {
    const {pets} = this.props;
    const {bottom, scrollable} = this.state;
    let dogs, cats, other, small, hypoallergenic, outdoor, pet_notes;

    if (pets !== null) {
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

      let current_pets =  {
        animals: animals.map(v => {return v}),
        rules: rules.map(v => {return v}),
        notes: notes,
      }

      dogs = current_pets.animals.includes('dogs');
      cats = current_pets.animals.includes('cats');
      other = current_pets.animals.includes('other');
      small = current_pets.rules.includes('small');
      hypoallergenic = current_pets.rules.includes('hypoallergenic');
      outdoor = current_pets.rules.includes('outdoor');
      pet_notes = current_pets.notes;
    }

    return(
      <React.Fragment>
      {pets !== null &&
      <div className="row justify-content-between mb-3 pl-3 pets">
        <p className="col-2 pr-0 d-inline-block"><i className="fas fa-paw"></i> Pets:</p>
        {(dogs || cats || other) && <div className="col-2 d-inline-block">
          {dogs && <React.Fragment><small>Dogs</small>{(cats || other) && <React.Fragment>, <br/></React.Fragment>}</React.Fragment>}
          {cats && <React.Fragment><small>Cats</small>{other && <React.Fragment>, <br/></React.Fragment>}</React.Fragment>}
          {other && <React.Fragment><small>Other</small></React.Fragment>}
        </div>}
        {(hypoallergenic || outdoor || small) && <React.Fragment>
        <hr className="vr"/>
        <div className="col-3 px-auto d-inline-block">
          {small && <React.Fragment><small>Small Only</small>{(hypoallergenic || outdoor) && <React.Fragment>, <br/></React.Fragment>}</React.Fragment>}
          {hypoallergenic && <React.Fragment><small>Hypoallergenic</small>{outdoor && <React.Fragment>, <br/></React.Fragment>}</React.Fragment>}
          {outdoor && <React.Fragment><small>Outdoor Only</small></React.Fragment>}
        </div></React.Fragment>}
        {pet_notes && <React.Fragment>
        <hr className="vr"/>
        <div className="col-4 d-inline-block">
          <div className="row">
            <div className="col-3 px-0 d-inline-block"><small className="font-weight-bold">Notes: </small></div>
            <div className="col-9 pr-0 d-inline-block position-relative">
              <div style={{maxHeight: '75px', overflow: 'scroll'}} ref={this.petScrollRef} onScroll={this.handleScroll}>
                <small>{pet_notes}{![".", "!", "?", "..."].includes(pet_notes.slice(-1)) && "."}</small>
              </div>
              {!bottom && scrollable &&
                <div className="position-absolute"
                style={{width: 200,
                  right: 0,
                  bottom: 0,
                  height: 20,
                  background: 'linear-gradient(to top, rgba(220,53,69,1), rgba(220,53,69,0))'}}>
                </div>}
            </div>
          </div>
        </div></React.Fragment>}
      </div>}
      </React.Fragment>
    )
  }

}

const Amenities = (props) => {

  const {property, start_date, end_date, booking_id, guest, paid} = props;

  const initiateStripeCheckout = () => {
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

  let days;

  if (start_date && end_date) {
    days = moment(end_date).diff(moment(start_date), 'days');
  }

  const {
    id,
    title,
    description,
    city,
    country,
    property_type,
    price_per_night,
    max_guests,
    bedrooms,
    beds,
    baths,
    image_url,
    parking,
    enhanced_clean,
    parties,
    smoking,
    pets,
    laundry,
    internet,
    tv,
    kitchen,
    hair_dryer,
    notes,
    host,
  } = property

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
    <React.Fragment>
      <div className="col-12">
        <h3 className="mb-1">{title}</h3>
        <small className="link-text-muted">
          <p className="col-8 d-inline-block mb-0 px-0">{phraseCaps(property_type)}</p>
          <p className="col-4 d-inline-block mb-0 px-0 text-uppercase "><strong>{city}</strong>, {phraseCaps(country)}</p>
          <p className="mb-3 link-text-muted">Hosted by <b>{host.name}</b></p>
        </small>
        <p>{description}</p>
      </div>
      {start_date && end_date && booking_id && <React.Fragment>
      <hr/>
      <div className="col-6 d-inline-block">
        <p><span className="mr-1">Arrive:</span>
          <strong>{new Date(start_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong>
        </p>
        <p><span className="mr-1">Total:</span>
          $<strong className="mr-1">{(price_per_night * days).toLocaleString()}</strong>
          (<small className="font-italic">${price_per_night}/night</small>)
        </p>
      </div>
      <div className="col-6 d-inline-block">
        <p><span className="mr-1">Depart:</span>
          <strong>{new Date(end_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong>
        </p>
        {paid ? <button className="btn btn-light text-success w-100" disabled>Paid</button> : <button className="btn btn-light text-primary w-100" onClick={() => {initiateStripeCheckout()}}>Pay Now</button> }
      </div>
      </React.Fragment>}
      <hr />
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
      <hr/>
      <p className="col-6 d-inline-block">{max_guests} - Guest Maximum</p>
      {enhanced_clean !== null && (enhanced_clean ? <p className="col-6 d-inline-block">*<a href="https://www.airbnb.ca/d/enhancedclean" className="font-weight-bold link-text" target="_blank">Enhanced Clean</a></p> : <p className="col-6 d-inline-block link-text-muted"><strong>No</strong> *<a href="https://www.airbnb.ca/d/enhancedclean" className="link-text-muted" target="_blank">Enhanced Clean</a></p>)}
      {parties !== null && <p className="col-6 d-inline-block">{parties ? <i className="fas fa-users mr-2"></i> : <React.Fragment><i className="fas fa-users-slash mr-2 ban"></i><strong className="ban">No </strong></React.Fragment>}Parties Allowed</p>}
      {smoking !== null && <p className="col-6 d-inline-block">{smoking ? <i className="fas fa-smoking mr-2"></i> : <React.Fragment><i className="fas fa-smoking-ban mr-2 ban"></i><strong className="ban">Non</strong>-</React.Fragment>}Smoking</p>}
      <Pets pets={pets}/>
      <hr/>
      <div className="row col-12">
        <div className="col-5 pr-0 d-inline-block">
          Additional Notes:
        </div>
        <div className="col-7 px-0 d-inline-block">
          {notes !== null ? <p>{notes}</p> : <p className="link-text-muted text-center">(None)</p>}
        </div>
      </div>
    </React.Fragment>
  )
}

export default Amenities
