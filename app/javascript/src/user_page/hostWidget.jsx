import React from 'react';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import BookingsCalendar from './bookingsCalendar'
import placeholder from '@src/placeholder.png';

class PropertyEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      edit: false,
      id: '',
      title: '',
      description: '',
      image_url: null,
      price: 0,
      type: '',
      city: '',
      country: '',
      image_text: false,
      baths: 0,
      bedrooms: 1,
      beds: 1,
      max_guests: 1,
      existingBookings: false,
      selected: false,
    }
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    let {property} = this.props;
    let url = property.image_url;
    if (property.image != null) {url = property.image};
    this.setState({
      id: property.id,
      title: property.title,
      description: property.description,
      image_url: url,
      price: property.price_per_night,
      type: property.property_type,
      city: property.city,
      country: property.country,
      baths: property.baths,
      bedrooms: property.bedrooms,
      beds: property.beds,
      max: property.max_guests,
    })
  }

  editProperty() {
    this.setState({edit: !this.state.edit});
  }

  handleChange () {
    switch(event.target.name) {
      case 'title': this.setState({title: event.target.value}); break;
      case 'price': this.setState({price: event.target.value}); break;
      case 'type': this.setState({type: event.target.value}); break;
      case 'city': this.setState({city: event.target.value}); break;
      case 'country': this.setState({country: event.target.value}); break;
      case 'description': this.setState({description: event.target.value}); break;
      case 'bedrooms': this.setState({bedrooms: event.target.value}); break;
      case 'beds': this.setState({beds: event.target.value}); break;
      case 'baths': this.setState({baths: event.target.value}); break;
      case 'max': this.setState({max: event.target.value}); break;
    }

  }

  handleImage() {
    this.setState({image_url: URL.createObjectURL(event.target.files[0])})
  }

  saveChanges () {
    let {id, title, image_url, description, price, type, city, country, baths, bedrooms, beds, max} = this.state;
    let image = this.inputRef.current.files[0];

    let formData = new FormData();

    if (image != null) {
      formData.append('property[image]', image, image.name);
    } else {
      formData.append('property[image_url]', image_url);
    }

    formData.append('property[title]', title);
    formData.append('property[description]', description);
    formData.append('property[price_per_night]', price);
    formData.append('property[property_type]', type);
    formData.append('property[beds]', beds);
    formData.append('property[baths]', baths);
    formData.append('property[bedrooms]', bedrooms)
    formData.append('property[max_guests]', max)

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
    }).catch((error) => {
      console.log(error);
    })

    this.editProperty();

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

  render () {
    let {selected, existingBookings, id, image_url, title, description, price, type, city, country, edit, image_text, baths, bedrooms, beds, max} = this.state;

    let toggle = this.editProperty.bind(this);
    let save = this.saveChanges.bind(this);
    let change = this.handleChange.bind(this);
    let image_change = this.handleImage.bind(this);
    let delete_property = this.deleteProperty.bind(this);
    let current = this.getPropertyBookings.bind(this);
    let passSelected = this.passSelected.bind(this)

    if(image_url == null) {image_url = placeholder}

    let type_caps = type.split(" ").map(word => {
      if (word == 'in') {return word}
      return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(" ")

    if (edit) {
      return (
        <div className="py-4 px-4 property row" key={id}>
          <div className="col-12 col-md-4">
            <div className="image-container rounded" onMouseOver={() => {this.setState({image_text: true})}} onMouseOut={() => {this.setState({image_text: false})}}>
              <label className="my-0">
                <img src={image_url} className="property-image image-edit rounded" alt="Image of Property"/>
                {image_text && <span className="image-text">Change Image?</span>}
                <input type="file" className="image-select" name="image" accept="image/*" ref={this.inputRef} onChange={image_change}/>
              </label>
            </div>
            <button className="btn btn-danger d-block my-5 mx-auto border-white" onClick={current}>Current Bookings</button>
          </div>
          <div className="col-12 col-md-6">
            <table>
              <tbody>
                  <tr>
                    <td className="text-white">Title:</td>
                    <td className="text-white">
                      <input type="text" name="title" className="px-2 w-100 rounded" value={title} onChange={change}/>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-white">Type:</td>
                    <td className="text-white">
                    <select className="property-type" name="type" value={type} onChange={change}>
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
                    <td className="text-white">Description:</td>
                    <td className="text-white">
                      <textarea name="description" className="px-2 w-100 rounded" value={description} onChange={change}/>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-white">Price:</td>
                    <td className="text-white">
                      $  <input type="number" name="price" className="px-1 w-25 rounded" value={price} onChange={change}></input>  {country.toUpperCase()}D / night
                    </td>
                  </tr>
                  <tr>
                    <td className="text-white">Location:</td>
                    <td className="text-white">
                      <input type="text" name="city" className="px-2 rounded w-50" value={city} onChange={change}></input>
                      <select className="ml-2" value={country} name="country" onChange={change}>
                        <option value="us">U.S.A</option>
                        <option value="ca">Canada</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-white">Beds:
                      <input type="number" name="beds" className="px-1 w-25 rounded ml-5" value={beds} onChange={change}/>
                    </td>
                    <td className="text-white">Baths:
                      <input type="number" name="baths" className="px-1 w-25 rounded ml-5" value={baths} onChange={change}/>
                    </td>

                  </tr>
                  <tr>
                    <td className="text-white pb-1">Bedrooms:
                      <input type="number" name="bedrooms" className="px-1 w-25 rounded ml-2" value={bedrooms} onChange={change}/>
                    </td>
                    <td className="text-white pb-1">
                    Max Guests:
                      <input type="number" name="max" className="px-1 w-25 rounded ml-2" value={max} onChange={change}/>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
          <div className="col-12 col-md-2 button_divs">
            <div>
              <button className="btn btn-primary text-nowrap" href="" onClick={save}>Save Changes</button>
            </div>
            <div>
              <button className="btn btn-dark font-weight-bold text-danger" href="" onClick={delete_property}>Delete</button>
            </div>
          </div>
        </div>
      )
    }

    let bookings;

    if (existingBookings.length !== undefined) {

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
              <p className="font-weight-bold">{booking.guest}</p>
              {booking.paid ? <p className="font-italic">All Paid!</p> : <p className={notPaid}>Not Paid</p>}
            </div>
          </div>
        )
      })
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
          <div>
            <BookingsCalendar bookings={existingBookings} passSelected={passSelected}/>
          </div>
        </React.Fragment>
        :
        <React.Fragment>
        <div className="col-12 col-md-4">
          <div className="image-container rounded">
            <img src={image_url} className="property-image rounded"/>
          </div>
          <button className="btn btn-danger border-white d-block my-5 mx-auto" onClick={current}>Current Bookings</button>

        </div>
        <div className="col-12 col-md-7 text-white">
          <h5 className="font-weight-bold w-100 mx-auto mb-1 text-center text-white">{title}</h5>
          <p className="text-center font-italic">{type_caps}</p>
          <p className="px-3"> {description} </p>
          <hr/>
          <div className="col-6 d-inline-block">
            <p>$ <strong>{price}</strong> <small>{country.toUpperCase()}D / night</small></p>
            <p>Baths: {baths}</p>
            <p>Bedrooms: {bedrooms}</p>
          </div>
          <div className="col-6 d-inline-block">
            <p><strong>{city}</strong>, {country.toUpperCase()}</p>
            <p>Beds: {beds}</p>
            <p>Max Guests: {max}</p>
          </div>
        </div>
        <div className="col-12 col-md-1 button_divs">
          <div>
            <button className="btn btn-light" href="" id={id} onClick={toggle}>Edit</button>
          </div>
          <div>
            <button className="btn btn-dark font-weight-bold text-danger" href="" onClick={delete_property}>Delete</button>
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
          image_url: null,
          max_guests: 1,
          description: "Enter your description here",
        }
      }),
    }))
      .then(handleErrors)
      .then(this.startLoading())
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
      })
  }

  passSelected(selected) {
    this.setState({ selected: selected })
  }

  render() {
    let {properties, loading, existingBookings, selected} = this.state;

    let editors = <div></div>
    if (properties.length !== undefined) {
      editors = properties.map((property) => {
      return <PropertyEditor property={property} loading={this.startLoading} refresh={this.getUserProperties} key={property.id}/>
      })
    }

    let bookings;
    if (existingBookings) {
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
              <p className="font-weight-bold">{booking.guest}</p>
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
          <div className={loading ? "" : (existingBookings ? "bookings-all" : "property-scroll") + " col-12" }>
            {!loading && (existingBookings ?
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
            : editors)}
          </div>

          {loading ? <p className="mx-auto my-auto text-center text-white">loading...</p> :
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
          </React.Fragment>
          }
        </div>
      </div>
    );
  }

}

export default HostWidget;
