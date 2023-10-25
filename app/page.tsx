import AllArticles from "components/AllArticles";

export default async function Page() {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 py-20 text-white mb-10">
        <div className="container mx-auto text-center prose">
          <h1 className="text-4xl font-bold text-white">Hey Y'all!</h1>
          <p className="mt-4 text-xl text-white">
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
      </div>

      <div className="container mx-auto">
        <div className="flex flex-row justify-between">
          {/*<img src="/underconstruction.gif" alt="under construction" />*/}
          {/*<img src="/underconstruction.gif" alt="under construction" />*/}
          {/*<img src="/underconstruction.gif" alt="under construction" />*/}
          {/*<img src="/underconstruction.gif" alt="under construction" />*/}
        </div>
        <div className="flex justify-center">
          <img src="/underconstruction.gif" alt="under construction" />
          <img src="/underconstruction-bar.gif" alt="under construction" />
          <img src="/underconstruction-bar.gif" alt="under construction" />
          <img src="/underconstruction-bar.gif" alt="under construction" />
          <img src="/underconstruction.gif" alt="under construction" />
        </div>
        <AllArticles />
      </div>
    </>
  );
}
