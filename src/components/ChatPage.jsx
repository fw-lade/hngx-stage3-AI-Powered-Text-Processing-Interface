import React, { useState } from "react";

// Define detectLanguage function before the component
const detectLanguage = async (text) => {
  if (!text.trim()) return;

  try {
    // Check if API exists
    if (typeof chrome !== "undefined" && "detectLanguage" in chrome) {
      const result = await chrome.detectLanguage(text);
      console.log("Detected Language:", result.languages); // Array of detected languages
      return result.languages[0] || "Unknown";
    } else {
      console.error("Language Detection API not available.");
      return "Unknown";
    }
  } catch (error) {
    console.error("Language Detection Error:", error);
    return "Unknown";
  }
};



const handleSend = async () => {
  if (!inputText.trim()) return;
  setLoading(true);

  const detectedLang = await detectLanguage(inputText);

  const newOutput = {
    text: inputText,
    language: detectedLang || "Unknown",
  };

  setOutput([...output, newOutput]);
  setInputText("");
  setLoading(false);
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
