'use client';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { StarIcon } from '@heroicons/react/20/solid';

const testimonials = [
  {
    text: 'Anthony is highly professional, has a great sense of urgency and over-delivered on my project. He was very responsive on some tight deadlines and helped me resolve multiple WordPress site improvements and optimization. I highly recommend Anthony. His work and finished product was my best Upwork/Elance experience to date.',
    author: 'Doug Wilks',
    link: 'strengthslauncher.com',
  },
  {
    text: 'Fantastic work! Anthony had my site up and running within a few hours. Extremely professional and highly recommended. I will definitely do business with him again in the future. Thanks again!',
    author: 'Jonathan - Owner Plane Schemer LLC',
    link: 'planeschemer.com',
  },
  {
    text: 'Anthony was awesome. He did a great job. He has a good command of the required skills and what he did not have at the tip of his fingers - he took the time to research and was a quick study. Takes instruction well - no ego issues. Just wants the job done well. I recommend him for your next gig!',
    author: 'YourWorkBuddy',
  },
  {
    text: "Anthony was AWESOME to work with. He got the job done quickly and actually communicated with me regularly. I was pleasantly surprised to finally find a programmer that knew what he was talking about. I'll definitely be using Anthony again in the future.",
    author: 'Doug Hermansen',
  },
];

export default function Testimonials() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <section className="bg-gradient-to-b from-gray-800 to-gray-900 pt-4 rounded-xl -mx-0 md:-mx-20 border-2 border-blue-600">
      <div className="p-4 text-center">
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <figure key={index} className="max-w-screen-md mx-auto">
              <blockquote>
                <p className="text-xl font-medium text-gray-900 text-white">
                  "{testimonial.text}"
                </p>
              </blockquote>
              <figcaption className="flex flex-col items-center justify-center mt-6 space-y-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-500" />
                  ))}
                </div>
                <div className="font-medium text-white">
                  {testimonial.author}
                </div>
                {testimonial.link && (
                  <div className="text-sm font-light text-gray-400">
                    <a
                      href={testimonial.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {testimonial.link}
                    </a>
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </Slider>
      </div>
    </section>
  );
}
