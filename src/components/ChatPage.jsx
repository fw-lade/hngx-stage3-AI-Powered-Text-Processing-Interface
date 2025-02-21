import React, { useState } from "react";

const API_BASE_URL = "https://api.chrome.com/ai"; // Replace with actual Chrome AI API URL

const ChatPage = () => {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newOutput = {
      text: inputText,
      language: "Detecting...",
      summary: null,
      translated: null,
    };

    setOutput([...output, newOutput]);
    setInputText("");

    // Detect language
    try {
      const langRes = await fetch(`${API_BASE_URL}/language-detection`, {
        method: "POST",
        body: JSON.stringify({ text: inputText }),
        headers: { "Content-Type": "application/json" },
      });
      const langData = await langRes.json();
      newOutput.language = langData.language;

      // Update the UI after language detection
      setOutput((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = newOutput;
        return updated;
      });
    } catch (error) {
      console.error("Language Detection Error:", error);
    }
  };

  const handleSummarize = async (index) => {
    if (output[index].summary || output[index].language !== "en") return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/summarizer`, {
        method: "POST",
        body: JSON.stringify({ text: output[index].text }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setOutput((prev) => {
        const updated = [...prev];
        updated[index].summary = data.summary;
        return updated;
      });
    } catch (error) {
      console.error("Summarization Error:", error);
    }
    setLoading(false);
  };

  const handleTranslate = async (index) => {
    if (!selectedLanguage || output[index].translated) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/translator`, {
        method: "POST",
        body: JSON.stringify({
          text: output[index].text,
          target: selectedLanguage,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setOutput((prev) => {
        const updated = [...prev];
        updated[index].translated = data.translation;
        return updated;
      });
    } catch (error) {
      console.error("Translation Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="chat-wrap">
      <div className="container">
        {/* Output Messages */}
        <div className="output-area">
          {output.map((item, index) => (
            <div key={index} className="message">
              <p>{item.text}</p>
              <small>Detected Language: {item.language}</small>
              {item.text.length >= 150 && item.language === "en" && (
                <button
                  onClick={() => handleSummarize(index)}
                  disabled={loading}
                >
                  Summarize
                </button>
              )}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>
              <button onClick={() => handleTranslate(index)} disabled={loading}>
                Translate
              </button>
              {item.summary && (
                <p>
                  <strong>Summary:</strong> {item.summary}
                </p>
              )}
              {item.translated && (
                <p>
                  <strong>Translated:</strong> {item.translated}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Input Field */}
        <div className="input-area">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your text here..."
          />
          <button onClick={handleSend}>📨</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
