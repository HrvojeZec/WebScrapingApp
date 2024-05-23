import React from "react";
import Slider from "react-slick";
import classes from "../../assets/stylesheets/scrape.module.scss";
import { useProductsData } from "../../stores/GetAllProducts";
export function SliderComponent() {
  const { data: Products } = useProductsData();
  const images = Products.map((product) => {
    return product.images;
  });

  const mergeImages = images.reduce((acc, curr) => acc.concat(curr), []);
  const settings = {
    infinite: true,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 4000,
    arrows: false,
    cssEase: "linear",
  };
  return (
    <div className={classes.image__content} data-aos="fade-left">
      <div className={classes.slider__container}>
        <Slider {...settings}>
          {mergeImages.map((image, index) => (
            <div key={index}>
              <img src={image} alt={`Slika ${index}`} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
