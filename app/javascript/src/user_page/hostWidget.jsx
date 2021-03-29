import React from 'react';
import { safeCredentials, handleErrors, authenticityHeader } from '@utils/fetchHelper';
import placeholder from '@src/placeholder.png';


class PropertyEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index: false,
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
      max_guests: 1
    }
    this.inputRef = React.createRef();
  }


  componentDidMount() {
    let {property, index} = this.props;
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
      index: index,
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
    /*
    if (image != null) {
      formData.append('property[image]', image, image.name);
    } else {
      formData.append('property[image_url]', image_url);
    }*/
    formData.append('property[image]', image, image.name);
    formData.append('property[title]', title);
    formData.append('property[description]', description);
    formData.append('property[price_per_night]', price);
    formData.append('property[property_type]', type);
    formData.append('property[beds]', beds);
    formData.append('property[baths]', baths);
    formData.append('property[bedrooms]', bedrooms)
    formData.append('property[max_guests]', max)
    console.log(...formData)
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

  render () {

    let {id, image_url, title, description, price, type, city, country, edit, image_text, baths, bedrooms, beds, max} = this.state;

    let toggle = this.editProperty.bind(this);
    let save = this.saveChanges.bind(this);
    let change = this.handleChange.bind(this);
    let image_change = this.handleImage.bind(this);
    let delete_property = this.deleteProperty.bind(this);

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
                <img src={image_url} className="property-image image-edit" alt="Image of Property"/>
                {image_text && <span className="image-text">Change Image?</span>}
                <input type="file" className="image-select" name="image" accept="image/*" ref={this.inputRef} onChange={image_change}/>
              </label>
            </div>
            <button className="btn btn-light d-block my-5 mx-auto text-danger font-weight-bold" href="">Current Bookings</button>
          </div>
          <div className="col-12 col-md-6">
            <table className="w-100">
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

    return (
      <div className="py-4 px-4 property row" key={id}>
        <div className="col-12 col-md-4">
          <div className="image-container rounded">
            <img src={image_url} className="property-image"/>
          </div>
          <button className="btn btn-light d-block my-5 mx-auto text-danger font-weight-bold" href="">Current Bookings</button>
        </div>
        <div className="col-12 col-md-6">
          <h5 className="font-weight-bold w-100 mx-auto mb-1 text-center text-white">{title}</h5>
          <p className="text-white text-center font-italic">{type_caps}</p>
          <p className="text-white px-3"> {description} </p>
          <hr/>
          <div className="col-6 d-inline-block">
            <p className="text-white">
              $ <strong>{price}</strong> <small>{country.toUpperCase()}D / night</small>
            </p>
            <p className="text-white">Baths: {baths}</p>
            <p className="text-white">Bedrooms: {bedrooms}</p>
          </div>
          <div className="col-6 d-inline-block">
            <p className="text-white"><strong>{city}</strong>, {country.toUpperCase()}</p>
            <p className="text-white">Beds: {beds}</p>
            <p className="text-white">Max Guests: {max}</p>
          </div>
        </div>
        <div className="col-12 col-md-2 button_divs">
          <div>
            <button className="btn btn-light" href="" id={id} onClick={toggle}>Edit</button>
          </div>
          <div>
            <button className="btn btn-dark font-weight-bold text-danger" href="" onClick={delete_property}>Delete</button>
          </div>

        </div>
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
    }
    this.addProperty = this.addProperty.bind(this)
    this.fetchUserProperties = this.fetchUserProperties.bind(this)
    this.startLoading = this.startLoading.bind(this)
  }


  componentDidMount() {
    this.fetchUserProperties()
  }

  startLoading () {
    this.setState({loading: true})
  }

  fetchUserProperties(){
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
      .then(this.fetchUserProperties())
      .catch((error) => {
        console.log(error);
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
    let {properties, total_pages, next_page, loading, edit} = this.state;
    let editors = <div></div>
    if (properties.length !== undefined) {
      editors = properties.map((property, index) => {
      return <PropertyEditor property={property} index={index} loading={this.startLoading} refresh={this.fetchUserProperties}/>
      })
    }
    return (
      <div className="container py-3">
        <div className="row justify-content-around">
          <button className="page-tab col-6 btn btn-danger">
            <h4 className="text-center mb-1">Your Properties</h4>
          </button>
          <button className="page-tab col-6 btn-outline-danger" onClick={this.props.toggle}>
            <h4 className="text-center mb-1">Your Stays</h4>
          </button>
        </div>
        <div className="row bg-danger content py-3">
          <div className={loading ? "" : "col-12 scrollable"}>
            {!loading && editors}
          </div>

          {loading ? <p className="mx-auto my-auto text-center text-white">loading...</p> :
          <div className="mx-auto my-auto">
            <button className="btn btn-primary" onClick={this.addProperty}>Add <strong>New</strong> Property</button>
          </div>}
        </div>
      </div>
    );
  }

}

export default HostWidget;
