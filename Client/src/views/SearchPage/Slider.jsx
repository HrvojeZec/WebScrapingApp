import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import classes from "../../assets/stylesheets/search.module.scss";
import { useProductsData } from "../../stores/GetRandomProducts";

export function SliderComponent() {
  const { data: products } = useProductsData();
  const [randomImages, setRandomImages] = useState([]);

  useEffect(() => {
    if (products?.length > 0) {
      const images = products
        .map((product) => product.images)
        .reduce((acc, curr) => acc.concat(curr), []);
      setRandomImages(getRandomImages(images, 10));
    }
  }, [products]);

  function getRandomImages(images, count) {
    const shuffled = images.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

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
          {randomImages.map((image, index) => (
            <div key={index}>
              <img src={image} alt={`Slika ${index}`} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
