// home.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@templates/layout';
import { ImageViewer } from '@templates/imageViewer';
import { handleErrors, safeCredentials } from '@utils/fetchHelper';
import {random} from '@utils/utils';
import './home.scss';
import '@utils/animation.scss';

class Home extends React.Component {
  state = {
    authenticated: false,
    properties: [],
    total_pages: null,
    next_page: null,
    loading: true,
  }

  componentDidMount() {
    this.checkAuthenticated();
    fetch('/api/properties?page=1')
      .then(handleErrors)
      .then(data => {
        this.setState({
          properties: data.properties,
          total_pages: data.total_pages,
          next_page: data.next_page,
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

  handleLogOut = () => {
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

  render () {
    const { authenticated, properties, next_page, loading } = this.state;
    return (
      <Layout authenticated={authenticated} logout={this.handleLogOut}>
        {!loading ? <div className="container pt-4 fade-in">
          <h4 className="mb-1">Top-rated places to stay</h4>
          <p className="text-secondary mb-3">Explore some of the best-reviewed stays in the world</p>
          <div className="row h-100">
            {properties.map(property => {
              let url = property.image_url;

              if (property.images !== null && property.images !== undefined) {url = property.images[random(property.images.length)].image_url}
              return (
                <div key={property.id} className="col-6 col-lg-4 mb-4 property">
                  <a href={`/property/${property.id}`} className="text-body text-decoration-none">
                    <ImageViewer image_url={url}/>
                    <p className="text-uppercase mb-0 text-secondary"><small><b>{property.city}</b></small></p>
                    <h6 className="mb-0">{property.title}</h6>
                    <p className="mb-0"><small>${property.price_per_night} USD/night</small></p>
                  </a>
                </div>
              )
            })}
          </div>
          {(next_page === null) ||
            <div className="text-center">
              <button
                className="btn btn-light mb-4"
                onClick={this.loadMore}
              >load more</button>
            </div>}
        </div> :
        <div className="container">
          <div className="row content">
            <h5 className="d-block mx-auto my-auto text-center text-danger fade-cycle">loading...</h5>
          </div>
        </div>}
      </Layout>
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Home />,
    document.body.appendChild(document.createElement('div')),
  )
})
