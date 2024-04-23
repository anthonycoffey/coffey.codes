import { backend, frontend } from "./logos";
import LogoGrid from "./components/LogoGrid";
import { WorkHistory } from "./components/WorkHistory";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <div className="page">
        <div className="page-content">
          <h1 className="text-3xl font-bold mb-6">🤠Howdy Y'all!</h1>

          <p className="leading-1 lg:text-3xl tracking-wide font-bold">
            <b>My name is Anthony Coffey.</b> I am an Artist and Software
            Engineer living in Austin, Texas.
          </p>
          <p className="leading-1 tracking-wide">
            Spring, 2012. Driven by a passion for autonomy and limitless career
            potential, I stepped away from conventional job structures to chart
            my own path after graduating college. Determined to start my own web
            development business, I took to the streets to sell WordPress
            services door-to-door and luckily, this unconventional approach
            actually secured some of my first clients that helped me launch my
            software career. The rest, as they say, is history...
          </p>
          <p className="leading-1 tracking-wide">
            Since 2014, I have worked with hundreds of clients to develop and
            maintain custom software solutions designed to meet their unique
            needs. Throughout my decade-long career, I have cultivated a wealth
            of knowledge and expertise in systems architecture, cloud computing,
            and the software development lifecycle. This rich blend of
            experiences has not only sharpened my technical proficiency but also
            refined my interpersonal skills, establishing me as an energetic
            extrovert and a dependable team collaborator.
          </p>

          <p className="leading-1 tracking-wide">
            If you have a project you'd like to discuss with me, feel free to{" "}
            <a
              href="/contact"
              className="text-blue-500 hover:underline focus:underline focus:outline-none"
            >
              reach out
            </a>
            !
          </p>
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
