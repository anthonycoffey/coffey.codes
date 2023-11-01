import ContactForm from "./ContactForm";
export default function ContactPage() {
  return (
    <div className="container mx-auto flex grid grid-cols-1 md:grid-cols-2 mt-10">
      <div className="flex flex-col text-center md:text-left prose lg:prose-xl px-4">
        <h1 className="text-2xl font-bold mb-6">💌 Contact Me</h1>
        <ContactForm />
      </div>
      <div className="flex justify-center items-center content-center">
        <img
          src="/contact.png"
          alt="Contact"
          className="p-4 md:p-10 rounded-full mx-auto"
        />
      </div>
    </div>
  );
}
