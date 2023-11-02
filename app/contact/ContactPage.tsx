import ContactForm from "./ContactForm";
export default function ContactPage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="text-2xl font-bold mb-6">💌 Contact Me</h1>
        <ContactForm />
      </div>
      <div className="page-image">
        <img src="/contact.png" alt="Contact" />
      </div>
    </div>
  );
}
