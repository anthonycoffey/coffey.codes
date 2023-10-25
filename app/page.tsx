import AllArticles from "components/AllArticles";

export default async function Page() {
  return (
    <>
      <section className="bg-gradient-to-b from-blue-600 to-purple-500 py-10 text-white mb-10">
        <div className="container mx-auto text-center prose lg:prose-xl">
          <h1 className="text-4xl font-bold text-white">Hey Y'all!</h1>
          <p className="text-2xl text-white">
            Welcome to my new website! I'm still working on it, but I hope you
            like the new look!
          </p>
          <a
            href="/contact"
            className="mt-8 bg-white text-blue-500 hover:bg-blue-700 hover:text-white hover:drop-shadow-lg text-lg font-bold py-2 px-6 rounded-full inline-block no-underline"
          >
            Contact Me
          </a>
        </div>
      </section>

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
