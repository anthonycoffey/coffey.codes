import ContactForm from "./ContactForm";
export default function ContactPage() {
  return (
    <div className="max-w-screen-xl mx-auto rounded-md flex grid grid-cols-2 py-10">
      <div className="mr-6">
        <img
          src="/contact.png" // Replace with the path to your image
          alt="Contact"
          className="rounded-full"
        />
      </div>
      <div className="flex flex-col prose lg:prose-xl">
        <h1 className="text-2xl font-bold mb-6">💌 Contact Me</h1>
        <ContactForm />
      </div>
    </div>
  );
}
