import { backend, frontend } from "./logos";
import LogoGrid from "./components/LogoGrid";
import { WorkHistory } from "./components/WorkHistory";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <div className="page">
        <div className="page-content">
          <h1 className="leading-1 text-3xl mb-0 mt-10">Anthony Coffey</h1>
          <span className="block mt-1 text-xl p-0 text-gray-800 italic">
            Software Engineer, Solutions Architect, Artist
          </span>
          <div className="social-icons">
            <a
              href="https://www.linkedin.com/in/coffeyanthony/"
              target="_blank"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.3c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm13.5 12.3h-3v-5.6c0-3.4-4-3.1-4 0v5.6h-3v-11h3v1.5c1.4-2.6 7-2.8 7 2.5v7z" />
              </svg>
            </a>
            <a href="https://twitter.com/coffeywebdev" target="_blank">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 4.6c-.9.4-1.8.7-2.8.8 1-.6 1.8-1.6 2.2-2.7-.9.6-2 1-3.1 1.2-.9-.9-2.1-1.5-3.5-1.5-2.7 0-4.8 2.2-4.8 4.8 0 .4 0 .7.1 1.1-4-.2-7.5-2.1-9.9-5-.4.7-.6 1.5-.6 2.4 0 1.6.8 3.1 2.1 3.9-.8 0-1.5-.2-2.1-.6 0 2.3 1.6 4.2 3.7 4.6-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1.6 2 2.4 3.4 4.6 3.5-1.6 1.3-3.7 2-5.9 2-.4 0-.8 0-1.2-.1 2.1 1.3 4.6 2.1 7.3 2.1 8.7 0 13.5-7.2 13.5-13.5v-.6c.9-.7 1.7-1.5 2.3-2.4z" />
              </svg>
            </a>
            <a href="https://github.com/anthonycoffey" target="_blank">
              <svg
                className="icon"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 2.8 3.3 2 .3-.6.5-1.3.6-1.6-2.7-.3-5.5-1.4-5.5-6 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.3 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.3 3.3-1.3.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.7-5.5 6 .3.3.6.9.6 1.9v2.8c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4 0-6.6-5.4-12-12-12z" />
              </svg>
            </a>
          </div>

          <p className="leading-loose sm:text-left">
            In 2012, fresh out of college, I decided to take a leap and turn my
            passion for web development into a full-time business. I started
            small, knocking on doors and offering WordPress websites, which
            surprisingly helped me land my first few clients. It was a humble
            beginning, but it paved the way for everything that came after.
          </p>
          <p className="leading-loose sm:text-left">
            By 2014, encouraged by my mentors, I joined Elance (which later
            became UpWork), and my freelance career truly took off. Since then,
            I've worked with hundreds of clients, developing custom software
            solutions tailored to their unique needs. Along the way, I've honed
            my skills in systems architecture, cloud computing, and the software
            development lifecycle. More importantly, I’ve learned how to be a
            great collaborator — committed to every project I take on and
            passionate about delivering high value work.
          </p>

          <div className="flex flex-col justify-center bg-blue-100 p-10 rounded-lg items-center">
            <p className="text-2xl font-bold mb-4 text-center">
              Curious to learn more about my expertise?
            </p>
            <a
              href="/contact"
              className="px-8 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 no-underline"
            >
              Let's chat!
            </a>
          </div>
        </div>
        <div className="page-image">
          <Image
            src="/sidepanel.png"
            width={234 * 2}
            height={468 * 2}
            alt="Anthony Coffey - Artist, Musician and Software Engineer"
          />
        </div>
      </div>

      <div className="container mx-auto my-4">
        <div className="mb-10 px-4 mx-auto">
          <WorkHistory />
        </div>
      </div>

      <div className="container mx-auto mt-24">
        <div className="mb-10 px-4 text-center md:text-left mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Frontend Expertise
          </h1>
          <LogoGrid logos={frontend} />
        </div>
      </div>
      <div className="container mx-auto mt-24">
        <div className="mb-10 px-4 text-center md:text-left mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Cloud/Backend Expertise
          </h1>
          <LogoGrid logos={backend} />
        </div>
      </div>
    </>
  );
}
