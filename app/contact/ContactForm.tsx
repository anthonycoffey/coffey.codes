import React, { useState } from "react";
import axios from "axios";

type FormData = {
  name: string;
  email: string;

  message: string;
};
export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      message: event.currentTarget.value,
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios({
      method: "post",
      url: "https://us-central1-coffeywebdev-d0487.cloudfunctions.net/sendContactFormEmail",
      data: {
        name: formData?.name,
        email: formData?.email,
        message: formData?.message,
      },
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => {
        console.log("Email sent successfully");
        setMessageSent(true);
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  };

  return (
    <>
      {!messageSent ? (
        <>
          <form onSubmit={handleFormSubmit}>
            <div className="grid md:grid-cols-2 text-left">
              <div className="pr-2">
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-2 text-left">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="message"
                name="message"
                placeholder="Your message"
                value={formData.message}
                onChange={handleTextAreaChange}
              ></textarea>
            </div>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Send
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">
              Your message has been successfully delivered!
            </span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg
                className="fill-current h-6 w-6 text-green-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 5.652a.999.999 0 0 0-1.414 0L10 8.586 6.066 4.652a.999.999 0 1 0-1.414 1.414L8.586 10l-3.934 3.934a.999.999 0 1 0 1.414 1.414L10 11.414l3.934 3.934a.999.999 0 1 0 1.414-1.414L11.414 10l3.934-3.934a.999.999 0 0 0 0-1.414z" />
              </svg>
            </span>
          </div>
        </>
      )}
    </>
  );
}
