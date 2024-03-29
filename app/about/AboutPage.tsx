import { backend, frontend } from "./logos";
import LogoGrid from "./components/LogoGrid";
import { WorkHistory } from "./components/WorkHistory";

export default function AboutPage() {
  return (
    <>
      <div className="page">
        <div className="page-content">
          <h1 className="text-2xl font-bold mb-6">🤠Howdy Y'all!</h1>
          <p className="leading-1 tracking-wide">
            Welcome to my little corner of the internet! My name is Anthony
            Coffey and I'm an <u>Artist</u>, <u>Musician</u> and{" "}
            <u>Software Engineer</u> living in Austin, Texas.
          </p>
          <p className="leading-1 tracking-wide">
            In May of 2012, I graduated from Gulf Coast State College and
            started a business doing WordPress plugin and theme development.
          </p>
          <p className="leading-1 tracking-wide">
            I was able to launch my career right out of college thanks to some
            great mentors and the Elance platform, which was later acquired by
            Upwork.
          </p>
          <p className="leading-1 tracking-wide">
            Since then, I've gained valuable professional experience working as
            a sysadmin, engineer, and consultant for start-ups and small to
            medium-sized businesses.
          </p>
          <p className="leading-1 tracking-wide">
            March 2022, I was employed as a Full Stack Software Engineer at{" "}
            <a
              href="https://www.maranihealth.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline focus:underline focus:outline-none"
            >
              Marani Health
            </a>
          </p>
          <p className="leading-1 tracking-wide">
            If you have a project you'd like to discuss, please feel free to{" "}
            <a
              href="/contact"
              className="text-blue-500 hover:underline focus:underline focus:outline-none"
            >
              contact me
            </a>
            .
          </p>
        </div>
        <div className="page-image">
          <img src="/psych.png" alt="Contact" />
        </div>
      </div>

      <div className="container mx-auto">
        <div className="mb-10 px-4 mx-auto">
          <WorkHistory />
        </div>
      </div>

      <div className="container mx-auto mt-24">
        <div className="mb-10 px-4 text-center md:text-left mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Frontend Expertise
          </h1>
          <LogoGrid logos={frontend} />
        </div>
      </div>
      <div className="container mx-auto mt-24">
        <div className="mb-10 px-4 text-center md:text-left mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Cloud/Backend Expertise
          </h1>
          <LogoGrid logos={backend} />
        </div>
      </div>
    </>
  );
}
