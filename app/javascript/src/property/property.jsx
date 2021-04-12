// property.jsx
import React from 'react';
import Layout from '@src/templates/layout';
import BookingWidget from './bookingWidget';
import Amenities from '@src/templates/amenities';
import { ImageViewer } from '@src/templates/imageViewer';
import { handleErrors, safeCredentials } from '@utils/fetchHelper';
import { random } from '@utils/utils';
import './property.scss';
import '@utils/animation.scss';

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
        console.log(data)
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
    let image = property.image_url;
    if (property.images !== null && property.images !== undefined) {
      image = property.images[random(property.images.length)].image_url
    }
    if (loading) {
      return <div className="container">
        <div className="row loading">
          <h5 className="d-block mx-auto my-auto text-center text-danger fade-cycle">loading...</h5>
        </div>
      </div>;
    };

    return (
      <Layout authenticated={authenticated} logout={this.handleLogOut}>
        <div className="property-view fade-in">
          <div className="property-image mb-3" style={{ backgroundImage: `url(${image})` }} />
          <div className="container">
            <div className="row">
              <div className="col-12 col-lg-7">
                <Amenities property={property}/>
                <hr/>
                {property.images !== null && <ImageViewer images={property.images}/>}
              </div>
              <div className="col-12 col-lg-5">
                <BookingWidget property_id={property.id} price_per_night={property.price_per_night} checkAuthenticated={this.checkAuthenticated} authenticated={authenticated}/>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default Property
