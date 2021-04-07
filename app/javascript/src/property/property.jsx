// property.jsx
import React from 'react';
import Layout from '@src/layout';
import BookingWidget from './bookingWidget';
import { handleErrors, safeCredentials } from '@utils/fetchHelper';
import { phraseCaps } from '@utils/utils';
import './property.scss';

class Property extends React.Component {
  state = {
    authenticated: false,
    property: {},
    loading: true,
  }

  componentDidMount() {
    this.checkAuthenticated()
    fetch(`/api/properties/${this.props.property_id}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          property: data.property,
          loading: false,
        })
      })
  }

  checkAuthenticated() {
    fetch('/api/authenticated')
      .then(handleErrors)
      .then(data => {
        this.setState({
          authenticated: data.authenticated,
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
      };
    }).catch((error) => {
      console.log(error);
    })
  }

  readPetRules() {
    let {pets} = this.state.property;
    let animals = []
    let rules = []
    let notes, object;
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

  render () {
    const { property, loading, authenticated } = this.state;
    if (loading) {
      return <p className="text-center">loading...</p>;
    };

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
      user,
    } = property

    let dogs, cats, other, small, hypoallergenic, outdoor, pet_notes;

    if (pets !== null) {
      let current_pets = this.readPetRules();
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
        <div className="property-view">
          <div className="property-image mb-3" style={{ backgroundImage: `url(${image_url})` }} />
          <div className="container">
            <div className="row">
              <div className="info col-12 col-lg-7">
                <div className="mb-3">
                  <h3 className="mb-0">{title}</h3>
                  <p className="text-uppercase mb-0 text-secondary"><small>{city}</small></p>
                  <p className="mb-0"><small>Hosted by <b>{user.username}</b></small></p>
                </div>
                <div>
                  <p className="mb-0 text-capitalize"><b>{property_type}</b></p>

                </div>
                <hr />
                <p>{description}</p>
                <hr/>
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
                {enhanced_clean !== null ? <p className="col-6 d-inline-block"><a href="https://www.airbnb.ca/d/enhancedclean" className="font-weight-bold" target="_blank">Enhanced Clean</a></p> : <a href="https://www.airbnb.ca/d/enhancedclean" className="text-black-50" target="_blank">Enhanced Clean Not Offered</a>}
                {parties !== null && <p className="col-6 d-inline-block">{parties ? <i className="fas fa-users mr-2"></i> : <React.Fragment><i className="fas fa-users-slash mr-2 ban"></i><strong className="ban">No </strong></React.Fragment>}Parties Allowed</p>}
                {smoking !== null && <p className="col-6 d-inline-block">{smoking ? <i className="fas fa-smoking mr-2"></i> : <React.Fragment><i className="fas fa-smoking-ban mr-2 ban"></i><strong className="ban">Non</strong>-</React.Fragment>}Smoking</p>}
                {pets !== null &&
                <div className="row mb-3 pl-3 pets">
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
              <div className="col-12 col-lg-5">
                <BookingWidget property_id={id} price_per_night={price_per_night} checkAuthenticated={this.checkAuthenticated} authenticated={authenticated}/>
              </div>


            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default Property
