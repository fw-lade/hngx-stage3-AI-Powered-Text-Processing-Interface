import React, { useState } from "react";

// Define detectLanguage function before the component
const detectLanguage = async (text) => {
  if (!text.trim()) return;

  try {
    const res = await fetch("https://aistudio.google.com/api/detectLanguage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    console.log("Detected Language:", data.language); // Example: 'en', 'es'
    return data.language;
  } catch (error) {
    console.error("Language Detection Error:", error);
    return null;
  }
};

const ChatPage = () => {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    // Call detectLanguage function
    const detectedLang = await detectLanguage(inputText);

    const newOutput = {
      text: inputText,
      language: detectedLang || "Unknown",
    };

    setOutput([...output, newOutput]);
    setInputText("");
    setLoading(false);
  };

  return (
    <div className="chat-wrap">
      <div className="container">
        <div className="output-area">
          {output.map((item, index) => (
            <div key={index} className="message">
              <p>{item.text}</p>
              <small>Detected Language: {item.language}</small>
            </div>
          ))}
        </div>

        <div className="input-area">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your text here..."
          />
          <button onClick={handleSend} disabled={loading}>
            {loading ? "Detecting..." : "📨"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
