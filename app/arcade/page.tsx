import CodeEditor from "@/components/arcade/CodeEditor";

export default async function Arcade() {
  const handleSubmit = async () => {
    // Here, you would handle the submission of the code to your backend
    // Example POST request (you would need to configure the actual API endpoint)
    /*
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    console.log('Execution result:', data);
    */
  };

  return (
    <>
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Code Arcade</h1>
        <div className="flex flex-wrap md:flex-nowrap">
          <div className="challenge-section flex-1 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-md mr-4">
            <h2 className="text-2xl text-white font-semibold mb-4">
              JavaScript Challenge
            </h2>
            <p className="text-gray-300 mb-6">
              Description of the challenge...
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out mb-4">
              Start Challenge
            </button>
            <div className="reward-section bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl text-white font-semibold">
                Your XP: <span className="text-green-400">0</span>
              </h2>
              <h2 className="text-xl text-white font-semibold">
                Your Level: <span className="text-green-400">1</span>
              </h2>
            </div>
          </div>
          <div className="code-editor-section flex-1 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg shadow-md ml-4">
            <CodeEditor />
          </div>
        </div>
      </section>
    </>
  );
}
