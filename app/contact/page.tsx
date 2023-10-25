export default function Contact() {
  return (
    <>
      <div className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6">Contact Me</h1>
        <form action="#" method="POST">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-600 font-bold">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-600 font-bold">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Your Message"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
