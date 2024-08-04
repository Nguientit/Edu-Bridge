import { Carousel } from 'react-bootstrap';
export default function SlideList() {
    return (
        <Carousel data-bs-theme="dark">
            <Carousel.Item>
                <img style={{ height: "550px" }}
                    className="d-block w-100"
                    src="images/slide1.png"
                    alt="First slide"
                />
             
            </Carousel.Item>
            <Carousel.Item>
                <img style={{ height: "550px" }}
                    className="d-block w-100"
                    src="images/slide2.png"
                    alt="Second slide"
                />
              
            </Carousel.Item>
            <Carousel.Item>
                <img style={{ height: "550px" }}
                    className="d-block w-100"
                    src="images/slide3.png"
                    alt="Third slide"
                />
        
            </Carousel.Item>
            <Carousel.Item>
                <img
                    style={{ height: "550px" }}
                    className="d-block w-100"
                    src="images/slide4.png"
                    alt="Third slide"
                />
            
            </Carousel.Item>
            <Carousel.Item>
                <img
                     style={{ height: "550px" }}
                     className="d-block w-100"
                     src="images/slide5.jpg"
                    alt="Third slide"
                />
             
            </Carousel.Item>
        </Carousel>
    );
}