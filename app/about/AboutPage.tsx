import { frontend, backend } from "./logos";
import LogoGrid from "./components/LogoGrid";

export default function AboutPage() {
  return (
    <>
      <div className="page">
        <div className="page-content">
          <h1 className="text-2xl font-bold mb-6">👋 Hey Y'all</h1>
          <p className="leading-1 tracking-wide">
            My name is <b>Anthony Coffey</b> and I'm an <b>Artist</b>,{" "}
            <b>Musician</b> and <b>Software Engineer</b> living in{" "}
            <b>Austin, Texas</b>.
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
      {/*<div className="container mx-auto flex mt-24">*/}
      {/*  <div className="mb-10 px-4 text-center md:text-left mx-auto">*/}
      {/*    <LogoGrid logos={cloud} cols={10} />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  );
}
