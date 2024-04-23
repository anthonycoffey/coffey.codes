"use client";
import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodeEditor({}) {
  const [markers, setMarkers] = useState([]);
  function handleEditorChange(value, event) {
    console.log(event);
    console.log("here is the current model value:", value);
  }
  function handleEditorValidation(markers) {
    // model markers
    markers.forEach((marker) =>
      console.log("onValidate:", marker.message, { marker }),
    );
    setMarkers(markers);
  }
  return (
    <div className="relative">
      <Editor
        theme="vs-dark"
        height="42vh" // Set the height of the editor
        defaultLanguage="javascript"
        onChange={handleEditorChange}
        onValidate={handleEditorValidation}
        options={{
          inlineSuggest: true,
          fontSize: "22px",
          formatOnType: true,
          autoClosingBrackets: true,
          minimap: false,
        }}
      />

      <div className="errors">
        <span className="text-gray-400 text-sm font-medium">
          Errors: {markers.length}
        </span>
        {markers.map((marker, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-4 my-2 rounded-md shadow-sm"
          >
            <span className="text-white text-sm pl-3">ℹ️ {marker.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
