import React from 'react';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import { phraseCaps, varToString } from '@utils/utils';
import Amenities from '@src/templates/amenities'
import BookingsCalendar from './bookingsCalendar'
import placeholder from '@utils/placeholder.png';

class PropertyEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      edit: false,
      id: '',
      title: '',
      description: '',
      image_url: null,
      price_per_night: 0,
      property_type: '',
      city: '',
      country: '',
      image_text: false,
      baths: 0,
      bedrooms: 1,
      beds: 1,
      max_guests: 1,
      parking: null,
      enchanced_clean: null,
      parties: null,
      smoking: null,
      pets: null,
      laundry: null,
      internet: null,
      kitchen: null,
      hair_dryer: null,
      notes: null,
      existingBookings: false,
      selected: false,
    }
    this.imageRef = React.createRef();
    this.petRef = React.createRef();
    this.readPetRules = this.readPetRules.bind(this);
    this.loadProperty = this.loadProperty.bind(this);
  }

  componentDidMount() {
    this.loadProperty();
  }

  loadProperty() {
    let {property} = this.props;
    let url = property.image_url;
    if (property.image != null) {url = property.image};
    this.setState({
      id: property.id,
      title: property.title,
      description: property.description,
      image_url: url,
      price_per_night: property.price_per_night,
      property_type: property.property_type,
      city: property.city,
      country: property.country,
      baths: property.baths,
      bedrooms: property.bedrooms,
      beds: property.beds,
      max: property.max_guests,
      parking: property.parking,
      enhanced_clean: property.enhanced_clean,
      parties: property.parties,
      smoking: property.smoking,
      pets: property.pets,
      laundry: property.laundry,
      internet: property.internet,
      tv: property.tv,
      kitchen: property.kitchen,
      hair_dryer: property.hair_dryer,
      notes: property.notes,
    })
  }

  editProperty() {
    this.setState({edit: !this.state.edit});
  }

  handleChange () {
    switch(event.target.name) {
      case 'title': this.setState({title: event.target.value}); break;
      case 'price_per_night': this.setState({price_per_night: event.target.value}); break;
      case 'property_type': this.setState({property_type: event.target.value}); break;
      case 'city': this.setState({city: event.target.value}); break;
      case 'country': this.setState({country: event.target.value}); break;
      case 'description': this.setState({description: event.target.value}); break;
      case 'bedrooms': this.setState({bedrooms: event.target.value}); break;
      case 'beds': this.setState({beds: event.target.value}); break;
      case 'baths': this.setState({baths: event.target.value}); break;
      case 'max_guests': this.setState({max_guests: event.target.value}); break;
      case 'parking': this.setState({parking: event.target.value}); break;
      case 'enhanced_clean': this.setState({enhanced_clean: event.target.value}); break;
      case 'parties': this.setState({parties: event.target.value}); break;
      case 'smoking': this.setState({smoking: event.target.value}); break;
      case 'laundry': this.setState({laundry: event.target.value}); break;
      case 'internet': this.setState({internet: event.target.value}); break;
      case 'tv': this.setState({tv: event.target.value}); break;
      case 'kitchen': this.setState({kitchen: event.target.value}); break;
      case 'hair_dryer': this.setState({hair_dryer: event.target.value}); break;
      case 'notes': this.setState({notes: event.target.value}); break;
    }
  }

  handleImage() {
    this.setState({image_url: URL.createObjectURL(event.target.files[0])})
  }

  handlePetForm () {
    let animal, rule, notes;
    let delimiter = ";";
    let current = this.readPetRules()
    if (event.target.type == "checkbox") {
      switch (event.target.name) {
        case 'dogs': animal = event.target.name; break;
        case 'cats': animal = event.target.name; break;
        case 'other': animal = event.target.name; break;
        case 'small': rule = event.target.name; break;
        case 'outdoor': rule = event.target.name; break;
        case 'hypoallergenic': rule = event.target.name; break;
      }
      if (animal != undefined) {
        if (!current.animals.includes(animal)) {current.animals.push(animal)}
        else {current.animals = current.animals.filter(a => a != animal)}
      }
      else if (rule != undefined) {
        if (!current.rules.includes(rule)) {current.rules.push(rule)}
        else {current.rules = current.rules.filter(r => r != rule)}
      }
    } else {
      notes = event.target.value;
      if (notes != undefined) {current.notes = notes}
    }
    if (current.notes == undefined) {current.notes = ""}

    this.setState({pets: current.animals.join(',')+delimiter+current.rules.join(',')+delimiter+current.notes+delimiter})

  }

  readPetRules() {
    let {pets} = this.state;
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

  saveChanges () {
    let { id, title, image_url, description, price_per_night, property_type, city, country, baths, bedrooms, beds, max_guests, parking, enhanced_clean, parties, smoking, pets, laundry, internet, tv, kitchen, hair_dryer, notes } = this.state;

    let edits = {
      title, image_url, description, price_per_night, property_type, city, country, baths, bedrooms, beds, max_guests, parking, enhanced_clean, parties, smoking, pets, laundry, internet, tv, kitchen, hair_dryer, notes
    }

    let image = this.imageRef.current.files[0];

    let formData = new FormData();

    if (image != null) {
      formData.append('property[image]', image, image.name);
    }

    Object.entries(edits).forEach(edit => {
      if (edit[1] != null) {
        formData.append(`property[${edit[0]}]`, edit[1])
      }
    })

    fetch(`/api/properties/${id}`, {
      method: 'PUT',
      body: formData,
      contentType: false,
      credentials: 'include',
      mode: 'same-origin',
      headers: authenticityHeader()
    })
    .then(handleErrors)
    .then(res => {
      console.log(res)
    }).then(this.editProperty())
    .then(this.props.loading())
    .then(this.props.refresh())
    .then(this.loadProperty())
    .catch((error) => {
      console.log(error);
    })

  }

  deleteProperty () {
    let {loading, refresh} = this.props;
    if (confirm("Are you sure you want to delete this property?")) {
      fetch(`/api/properties/${this.state.id}`, safeCredentials({
        method: 'DELETE',
      }))
        .then(handleErrors)
        .then(loading)
        .then(refresh)
        .catch((error) => {
          console.log(error);
        })
    }

  }

  getPropertyBookings() {
    this.setState({edit: false})
    fetch(`/api/properties/${this.state.id}/host`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          existingBookings: data.bookings
        })
      })
  }

  passSelected(selected) {
    this.setState({ selected: selected })
  }

  addAmenity() {
    event.preventDefault()
    switch(event.target.value) {
      case 'parking': this.setState({parking: 1}); break;
      case 'enhanced_clean': this.setState({enhanced_clean: true}); break;
      case 'parties': this.setState({parties: false}); break;
      case 'smoking': this.setState({smoking: false}); break;
      case 'pets': this.setState({pets: ';;;'}); break;
      case 'laundry': this.setState({laundry: 'washer only'}); break;
      case 'internet': this.setState({internet: 'dial-up'}); break;
      case 'tv': this.setState({tv: true}); break;
      case 'kitchen': this.setState({kitchen: 'kitchen'}); break;
      case 'hair_dryer': this.setState({hair_dryer: true}); break;
      case 'notes': this.setState({notes: ""}); break;
    }
    event.target.value = ""
  }

  render () {

    let {selected, existingBookings, id, image_url, title, description, price_per_night, property_type, city, country, edit, image_text, baths, bedrooms, beds, max_guests, parking, enhanced_clean, parties, smoking, pets, laundry, internet, tv, kitchen, hair_dryer, notes} = this.state;

    let dogs, cats, other, small, hypoallergenic, outdoor, pet_notes;

    let toggleEdit = this.editProperty.bind(this);
    let save = this.saveChanges.bind(this);
    let change = this.handleChange.bind(this);
    let image_change = this.handleImage.bind(this);
    let delete_property = this.deleteProperty.bind(this);
    let current = this.getPropertyBookings.bind(this);
    let passSelected = this.passSelected.bind(this);
    let addAmenity = this.addAmenity.bind(this);
    let petForm = this.handlePetForm.bind(this);

    let bookings = <div className="row justify-content-center align-content-center h-100"><h4 className="text-white-50 text-center font-italic">No bookings!</h4></div>;

    if (pets) {
      let current_pets = this.readPetRules();
      dogs = current_pets.animals.includes('dogs');
      cats = current_pets.animals.includes('cats');
      other = current_pets.animals.includes('other');
      small = current_pets.rules.includes('small');
      hypoallergenic = current_pets.rules.includes('hypoallergenic');
      outdoor = current_pets.rules.includes('outdoor');
      pet_notes = current_pets.notes;
    }

    if(image_url == null) {image_url = placeholder}

    if (edit) {
      return (
        <div className="py-4 px-4 property row" key={id}>
          <div className="col-12 col-md-4">
            <div className="image-container rounded" onMouseOver={() => {this.setState({image_text: true})}} onMouseOut={() => {this.setState({image_text: false})}}>
              <label className="my-0">
                <img src={image_url} className="property-image image-edit rounded" alt="Image of Property"/>
                {image_text && <span className="image-text">Change Image?</span>}
                <input type="file" className="image-select" name="image" accept="image/*" ref={this.imageRef} onChange={image_change}/>
              </label>
            </div>
            <button className="btn btn-danger d-block my-5 mx-auto border-white" onClick={current}>Current Bookings</button>
          </div>
          <div className="col-12 col-md-7 text-white py-2 editor-scroll">
            <table>
              <tbody>
                  <tr>
                    <td>Title:</td>
                    <td>
                      <input type="text" name="title" className="w-100 property-input" value={title} onChange={change}/>
                    </td>
                  </tr>
                  <tr>
                    <td>Type:</td>
                    <td>
                    <select className="property-input w-100" name="property_type" value={property_type} onChange={change}>
                      <optgroup label="Apartment">
                        <option value="entire apartment">Entire Apartment</option>
                        <option value="private room in apartment">Private Room in Apartment</option>
                        <option value="studio">Private Studio Apartment</option>
                      </optgroup>
                      <optgroup label="Condominium">
                        <option value="entire condominium">Entire Condo</option>
                        <option value="private room in condominium">Private Room in Condo</option>
                      </optgroup>
                      <optgroup label="House">
                        <option value="entire house">Entire House</option>
                        <option value="private room in house">Private Room in House</option>
                      </optgroup>
                    </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Description:</td>
                    <td>
                      <textarea name="description" className="w-100 property-input" value={description} onChange={change}/>
                    </td>
                  </tr>
                  <tr>
                    <td>Price:</td>
                    <td>
                      $  <input type="number" name="price_per_night" className="property-input" value={price_per_night} onChange={change}></input>  {country.toUpperCase()}D / night
                    </td>
                  </tr>
                  <tr>
                    <td>Location:</td>
                    <td>
                      <input type="text" name="city" className="property-input" value={city} onChange={change}></input>
                      <select className="ml-2 property-input" value={country} name="country" onChange={change}>
                        <option value="us">U.S.A</option>
                        <option value="ca">Canada</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
            </table>
            <hr/>
            <div className="amenities row">
              <div className="col-6 mb-2">Beds:
                <input type="number" name="beds" className="property-input" min="0" value={beds} onChange={change}/>
              </div>
              <div className="col-6 mb-2">Baths:
                <input type="number" name="baths" className="property-input" min="0" value={baths} onChange={change}/>
              </div>
              <div className="col-6 mb-2">Bedrooms:
                <input type="number" name="bedrooms" className="property-input" min="0" value={bedrooms} onChange={change}/>
              </div>
              {parking !==null &&
              <div className="col-6 mb-2">
              Parking Spots:
                <input type="number" name="parking" className="property-input" min="0" value={parking} onChange={change}/>
              </div>}
              {tv !== null &&
              <div className="col-6 mb-2">TV:
                <input name="tv" type="checkbox" className="property-input" checked={tv} onChange={change}/>
              </div>}
              {hair_dryer !== null &&
              <div className="col-6 mb-2">Hair Dryer:
                <input type="checkbox" name="hair_dryer" className="property-input" checked={hair_dryer} onChange={change}/>
              </div>}
              {laundry !== null &&
              <div className="col-6 mb-2">Laundry:
                <select name="laundry" className="property-input" value={laundry} onChange={change}>
                  <option value="washer only">Washer Only</option>
                  <option value="dryer only">Dryer Only</option>
                  <option value="washer and dryer">Washer & Dryer</option>
                  <option value="coin op">Coin Operated</option>
                  <option value="laundromat">Laundromat</option>
                  <option value="none">None</option>
                </select>
              </div>}
              {internet !== null &&
              <div className="col-6 mb-2">Internet:
                <select name="internet" className="property-input" value={internet} onChange={change}>
                  <option value="wifi">Wifi</option>
                  <option value="dial-up">Dial-Up</option>
                  <option value="ethernet">Ethernet</option>
                  <option value="none">None</option>
                </select>
              </div>}
              {kitchen !== null &&
              <div className="col-6 mb-2">Kitchen:
                <select name="kitchen" className="property-input" value={kitchen} onChange={change}>
                  <option value="kitchen">Kitchen</option>
                  <optgroup label="Only">
                    <option value="fridge only">Refrig. Only</option>
                    <option value="stove only">Stove Only</option>
                    <option value="oven only">Oven Only</option>
                  </optgroup>
                  <optgroup label="Omit">
                    <option value="no fridge">No Refrig.</option>
                    <option value="no stove">No Stove</option>
                    <option value="no oven">No Oven</option>
                  </optgroup>
                  <option value="none">None</option>
                </select>
              </div>}
            </div>
            <hr/>
            <div className="policies row">
              <div className="col-6 mb-2">Max Guests
                <input type="number" name="max_guests" className=" property-input" min="0" value={max_guests} onChange={change}/>
              </div>
              {enhanced_clean !== null &&
              <div className="col-6 mb-2"><a href="https://www.airbnb.ca/d/enhancedclean" className="text-white" target="_blank">*Enhanced Clean</a>:
                <input type="checkbox" name="enhanced_clean" className="property-input" checked={enhanced_clean} onChange={change}/><br/>
              </div>}
              {parties !== null &&
              <div className="col-6 mb-2">Parties:
                <select name="parties" className="property-input" value={parties} onChange={change}>
                  <option value={true}>Allowed</option>
                  <option value={false}>Not Allowed</option>
                </select>
              </div>}
              {smoking !== null &&
              <div className="col-6 mb-2">Smoking:
                <select name="smoking" className="property-input" value={smoking} onChange={change}>
                  <option value={true}>Allowed</option>
                  <option value={false}>Not Allowed</option>
                </select>
              </div>}
            </div>
            { pets !== null &&
            <form name="pets" className="pl-0 row ml-0" ref={this.petRef}>
              <div className="col-2 px-0 d-inline-block">Pets:</div>
              <table className="col-5 pets">
                <tbody>
                  <tr>
                    <td>
                      <label>
                        <input className="property-input" name="dogs" type="checkbox" checked={dogs} onChange={petForm}/>
                        <small>Dogs</small>
                      </label>
                    </td>
                    <td>
                      <label>
                        <input className="property-input" name="small" type="checkbox" checked={small} onChange={petForm}/>
                        <small>Small Pets Only</small>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>
                        <input className="property-input" name="cats" type="checkbox" checked={cats} onChange={petForm}/>
                        <small>Cats</small>
                      </label>
                    </td>
                    <td>
                      <label>
                        <input className="property-input" name="hypoallergenic" type="checkbox" checked={hypoallergenic} onChange={petForm}/>
                        <small>Hypoallergenic Only</small>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>
                        <input className="property-input" name="other" type="checkbox" checked={other} onChange={petForm}/>
                        <small>Other</small>
                      </label>
                    </td>
                    <td>
                      <label>
                        <input className="property-input" name="outdoor" type="checkbox" checked={outdoor} onChange={petForm}/>
                        <small>Outdoor Only</small>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="col-5 pr-0 d-inline-block">
                <textarea placeholder="Notes..." className="property-input pet-notes" value={pet_notes} onChange={petForm}/>
              </div>
            </form>}
            { notes !== null &&  <React.Fragment>
              <hr/>
              <p className="mb-2">Additional Notes:</p>
              <textarea name="notes" className="property-input w-100" value={notes} onChange={change}/>
            </React.Fragment>}
            { [parking, enhanced_clean, parties, smoking, pets, laundry, internet, tv, kitchen, hair_dryer, notes].includes(null) &&
            <select className="add-amenity property-input" name="add-amenity" onChange={addAmenity}>
              <option value="">--Add Amenity or Policy--</option>
              {addAmenityOptions()}
            </select>}
          </div>
          <div className="col-12 col-md-1 edit-buttons">
            <button className="btn btn-primary font-weight-bold mb-2" href="" onClick={save}>Save</button>
            <button className="btn btn-light mb-2" href="" onClick={() => {this.loadProperty(); toggleEdit()}}>Cancel</button>
            <button className="btn btn-dark text-danger" href="" onClick={delete_property}>Delete</button>
          </div>
        </div>
      )
    }

    if (existingBookings.length > 0) {

      bookings = existingBookings.map((booking) => {
        let bookingSelect = "booking py-2"
        let notPaid = "text-white-50"
        if (selected) {
          if (selected.id == booking.id) {
            bookingSelect += " booking-select";
            notPaid = "text-black-50"
          }
        }

        return(
          <div className={bookingSelect} key={booking.id}>
            <div className="col-6 d-inline-block" >
              <p>Arrives on <strong>{new Date(booking.start_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
              <p>Departs on <strong>{new Date(booking.end_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
            </div>
            <div className="col-2 d-inline-block">
              <p>Guest:</p>
              <p>Paid?</p>
            </div>
            <div className="col-4 d-inline-block">
              <p className="font-weight-bold">{booking.guest.name}</p>
              {booking.paid ? <p className="font-italic">All Paid!</p> : <p className={notPaid}>Not Paid</p>}
            </div>
          </div>
        )
      })
    }

    const addAmenityOptions = () => {
      let amenities = [enhanced_clean, tv, hair_dryer, parties, smoking, internet, parking, laundry, kitchen, pets, notes]
      let options = [
       <option key="enhanced_clean" value="enhanced_clean">Enhanced Clean</option>,
       <option key="tv" value="tv">Television</option>,
       <option key="hair_dryer" value="hair_dryer">Hair Dryer</option>,
       <option key="parties" value="parties">Parties</option>,
       <option key="smoking" value="smoking">Smoking</option>,
       <option key="internet" value="internet">Internet</option>,
       <option key="parking" value="parking">Parking</option>,
       <option key="laundry" value="laundry">Laundry</option>,
       <option key="kitchen" value="kitchen">Kitchen</option>,
       <option key="pets" value="pets">Pets</option>,
       <option key="notes" value="notes">Additional Notes</option>
     ];
       let list = options.map((opt, i) => {
         if (amenities[i] == null) {
           return opt
         }
       })
       return list;
    }

    return (
      <div className="py-4 px-4 property justify-content-around row">
      { existingBookings ?
        <React.Fragment>
          <div className="col-7 text-white">
            <h5 className="font-weight-bold w-100 mb-3 text-center">{title}</h5>
            <div className="booking-scroll">
              {bookings}
            </div>
            <button className="btn btn-light text-danger mt-3 d-block mx-auto" onClick={() => this.setState({existingBookings: false})}>Return to Property</button>
          </div>
          <BookingsCalendar bookings={existingBookings} passSelected={passSelected}/>
        </React.Fragment>
        :
        <React.Fragment>
        <div className="col-12 col-md-4">
          <div className="image-container rounded">
            <img src={image_url} className="property-image rounded"/>
          </div>
          <button className="btn btn-danger border-white d-block my-5 mx-auto" onClick={current}>Current Bookings</button>
        </div>
        <div className="col-12 col-md-7 editor-scroll py-2 text-white">
          <Amenities property={this.props.property} />
        </div>
        <div className="col-12 col-md-1 edit-buttons">
          <div>
            <button className="btn btn-light text-primary font-weight-bold mb-2" href="" id={id} onClick={toggleEdit}>Edit</button>
          </div>
          <div>
            <button className="btn btn-dark text-danger" href="" onClick={delete_property}>Delete</button>
          </div>
        </div>
        </React.Fragment>}
      </div>
    )

  }
}

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
    if (this.scrollRef.current != null) {
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

  addProperty = () => {
    let {properties} = this.state;
    fetch(`/api/properties`, safeCredentials({
      method: 'POST',
      body: JSON.stringify({
        property: {
          title: "Title",
          city: "City",
          country: "n/a",
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
      .then(this.getUserProperties())
      .catch((error) => {
        console.log(error);
      })

  }

  getHostBookings = () => {
    fetch(`/api/bookings/host`)
      .then(handleErrors)
      .then(data => {
        console.log(data);
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

    if (existingBookings.length > 0) {
      bookings = existingBookings.map(booking => {
        let bookingSelect = "booking py-2"
        let notPaid = "text-white-50"
        let ref = null;
        if (selected) {
          if (selected.id == booking.id) {
            ref = this.scrollRef;
            bookingSelect += " booking-select";
            notPaid = "text-black-50"
          }
        }
        return(
          <div className={bookingSelect} ref={ref} key={booking.id}>
            <div className="col-6 d-inline-block" >
              <p>Arrives on <strong>{new Date(booking.start_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
              <p>Departs on <strong>{new Date(booking.end_date + 'T00:00:00').toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong></p>
            </div>
            <div className="col-2 d-inline-block">
              <p>Guest:</p>
              <p>Paid?</p>
            </div>
            <div className="col-4 d-inline-block">
              <p className="font-weight-bold">{booking.guest.name}</p>
              {booking.paid ? <p className="font-italic">All Paid!</p> : <p className={notPaid}>Not Paid</p>}
            </div>
          </div>
        )
      })

    }

    return (
      <div className="container py-3">
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-danger">
            <h4 className="text-center mb-1">Your Properties</h4>
          </button>
          <button className="page-tab col-6 btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Your Trips</h4>
          </button>
        </div>
        <div className="row bg-danger content px-4 py-3">
          <div className={(loading || properties.length == 0) ? "" : (existingBookings ? "bookings-all" : "property-scroll") + " col-12" }>
            {!loading && (properties.length > 0 && (existingBookings ?
              <div className="row my-4">
                <div className="col-7 text-white">
                  <h5 className="font-weight-bold w-100 mb-3 text-center">All Bookings:</h5>
                  <div className="booking-scroll">
                    {bookings}
                  </div>
                </div>
                <div className="mx-auto">
                  <BookingsCalendar bookings={existingBookings} passSelected={this.passSelected}/>
                </div>
              </div>
            : editors))}
          </div>

          {loading ? <p className="mx-auto my-auto text-center text-white">loading...</p> : (properties.length > 0 ?
          <React.Fragment>
            <div className="mx-auto mb-auto">
            {existingBookings ?
              <button className="btn btn-light text-danger mx-auto" onClick={() => this.setState({existingBookings: false})}>Return to Properties</button>
              :
              <React.Fragment>
                <button className="btn btn-primary mr-2" onClick={this.addProperty}>Add <strong>New</strong> Property</button>
                <button className="btn btn-light text-danger ml-2" onClick={this.getHostBookings}>See All Bookings</button>
              </React.Fragment>
            }
            </div>
          </React.Fragment> :
          <React.Fragment>
            <h3 className="w-100 text-center text-white-50 mt-auto">You aren't hosting any properties right now!</h3>
            <div className="my-auto mx-auto">
              <button className="btn btn-light text-danger" onClick={this.addProperty}>Become a <strong>Host!</strong></button>
            </div>
          </React.Fragment>)
          }
        </div>
      </div>
    );
  }

}

export default HostWidget;
