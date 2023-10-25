export default function AboutPage() {
  return (
    <>
      <div className="max-w-screen-xl mx-auto rounded-md flex grid grid-cols-3 py-10">
        <div className="mr-10 p-1 items-center col-span-1">
          <img
            src="/psych.png" // Replace with the path to your image
            alt="Contact"
            className="rounded mb-10"
          />
          <img
            src="/abstract.png" // Replace with the path to your image
            alt="Contact"
            className="rounded w-full"
          />
        </div>
        <div className="prose lg:prose-xl col-span-2">
          <h1 className="text-2xl font-bold">👋 Hey Y'all</h1>
          <p className="leading-1 tracking-wide">
            My name is <b>Anthony Coffey</b> and I'm a <b>Software Engineer</b>,{" "}
            <b>Artist</b>, <b>Designer</b>, <b>Musician</b> and fellow{" "}
            <b>Human Being</b> from <b>Austin, Texas</b>.
          </p>
          <p className="tracking-wide">
            May 2012, I graduated from Gulf Coast State College and started a
            business doing WordPress development{" "}
            <small>(Linux/Apache/mySQL/PHP)</small>. I was able to launch my
            career right out of college thanks to some great mentors and the
            E-lance platform (which was later acquired by Upwork).
          </p>
          <p className="tracking-wide">
            Since then, I've gained valuable professional experience working as
            a system admin, engineer or consultant for start-ups and small to
            medium sized businesses.
          </p>
          <p className="tracking-wide">
            March 2022, I was employed as a Full Stack Software Engineer at{" "}
            <a href="https://www.maranihealth.com/" target="_blank">
              Marani Health
            </a>
          </p>

          <p className="tracking-wide">
            If you have a project you'd like to discuss, please feel free to{" "}
            <a href="/contact">contact me.</a>
          </p>
        </div>
      </div>
    </>
  );
}
