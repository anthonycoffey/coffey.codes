import AllArticles from "components/AllArticles";
import HeroSection from "../components/HeroSection";

export default async function Page() {
  return (
    <>
      {/*<HeroSection />*/}

      <section className="container mx-auto">
        <div className="flex justify-center">
          <img src="/underconstruction-bar.gif" alt="under construction" />
          <img src="/underconstruction-bar.gif" alt="under construction" />
          <img src="/underconstruction-bar.gif" alt="under construction" />
        </div>
        <AllArticles />
      </section>
    </>
  );
}
