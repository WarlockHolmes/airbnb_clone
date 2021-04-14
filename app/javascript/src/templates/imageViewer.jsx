import React from 'react';
import './imageViewer.scss';
import placeholder from '@utils/placeholder.png';

export const ImageViewer = (props) => {
      let {images, image_url} = props;
      if (images !== null && images !== undefined && image_url !== placeholder) {
        let imgFromUrl = {
          image_url: image_url,
          name: 'Image from url',
        }
        images.push(imgFromUrl)
      }
      return(<div className="fade-in">
        {images !== null && images !== undefined ?
          <React.Fragment>
          <div className="carousel slide" id="image-preview" data-ride="carousel">
            <div className="carousel-inner" role="listbox">
              {images.map((image, index) => {
                let url = image;
                if (image.image_url) {url = image.image_url}
                if (image instanceof File) {url = URL.createObjectURL(image)}
                let carouselClass = "carousel-item"
                if (index == 0) {carouselClass += " active"}
                return <div className={carouselClass} key={index}>
                  <img className="d-block h-100 rounded" src={url}/>
                </div>
              })}
            </div>
            <a className="carousel-control-prev" href="#image-preview" role="button" data-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="sr-only">Previous</span>
            </a>
            <a className="carousel-control-next" href="#image-preview" role="button" data-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="sr-only">Next</span>
            </a>
          </div>
        </React.Fragment>
        :
        (image_url &&
            <div className="image-container rounded">
              <img src={image_url} className="property-image rounded"/>
            </div>)}
      </div>)
    }
