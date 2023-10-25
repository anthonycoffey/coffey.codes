export default function ContactPage() {
  return (
    <div className="max-w-screen-xl mx-auto rounded-md flex grid grid-cols-2">
      <div className="mr-6">
        <img
          src="/contact.png" // Replace with the path to your image
          alt="Contact"
          className="rounded-full"
        />
      </div>
      <div className="flex flex-col prose lg:prose-xl">
        <h1 className="text-2xl font-bold mb-6">Contact Me</h1>
        <form>
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
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
