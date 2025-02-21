import React, { useState, useEffect } from "react";

const ChatPage = () => {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detector, setDetector] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en"); // Default to English

  useEffect(() => {
    const initLanguageDetector = async () => {
      try {
        const capabilities = await self.ai.languageDetector.capabilities();
        if (capabilities.capabilities === "no") {
          setApiAvailable(false);
          return;
        }

        let detectorInstance;
        if (capabilities.capabilities === "readily") {
          detectorInstance = await self.ai.languageDetector.create();
        } else {
          detectorInstance = await self.ai.languageDetector.create({
            monitor(m) {
              m.addEventListener("downloadprogress", (e) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            },
          });
          await detectorInstance.ready;
        }

        setDetector(detectorInstance);
      } catch (error) {
        console.error("Failed to initialize language detector:", error);
        setApiAvailable(false);
      }
    };

    initLanguageDetector();
  }, []);

  const detectLanguage = async (text) => {
    if (!text.trim() || !detector) return "Unknown";

    try {
      const result = await detector.detect(text);
      console.log("Detected Language:", result[0]);
      return result[0]?.detectedLanguage || "Unknown";
    } catch (error) {
      console.error("Language Detection Error:", error);
      return "Unknown";
    }
  };

  const translateText = async (text, sourceLang, targetLang) => {
    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const languagePair = await translatorCapabilities.languagePairAvailable(
        sourceLang,
        targetLang
      );

      console.log(`Language pair availability: ${languagePair}`);

      if (languagePair === "no") {
        throw new Error(
          `Translation from ${sourceLang} to ${targetLang} is not supported.`
        );
      }

      let translator;
      if (languagePair === "readily" || languagePair === "after-download") {
        translator = await self.ai.translator.create({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        });

        if (languagePair === "after-download") {
          await translator.ready;
        }

        const translatedText = await translator.translate(text);
        return translatedText;
      } else {
        throw new Error(`Translation is not available at the moment.`);
      }
    } catch (error) {
      console.error("Translation Error:", error);
      return "Translation failed";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !detector) return;
    setLoading(true);

    const detectedLang = await detectLanguage(inputText);

    const newOutput = {
      text: inputText,
      language: detectedLang,
      translatedText: null, // Initially, no translation
      summary: null, // Initially, no summary
    };

    setOutput([...output, newOutput]);
    setInputText("");
    setLoading(false);
  };

  const handleTranslate = async (index) => {
    const updatedOutput = [...output];
    const textToTranslate = updatedOutput[index].text;

    updatedOutput[index].translatedText = "Translating...";
    setOutput(updatedOutput);

    const detectedLang = updatedOutput[index].language;

    try {
      console.log(`Translating from ${detectedLang} to ${selectedLang}`);
      const translation = await translateText(
        textToTranslate,
        detectedLang,
        selectedLang
      );
      updatedOutput[index].translatedText = translation;
      setOutput([...updatedOutput]);
    } catch (error) {
      console.error("Translation failed:", error);
      updatedOutput[index].translatedText = "Translation failed";
      setOutput([...updatedOutput]);
    }
  };

  // Function to handle summarizing text
  const handleSummarize = async (index) => {
    const updatedOutput = [...output];
    const textToSummarize = updatedOutput[index].text;

    updatedOutput[index].summary = "Summarizing..."; // Show progress
    setOutput(updatedOutput);

    try {
      console.log("Summarizing text:", textToSummarize);

      // Call the Summarizer API here (replace this with actual API request)
      const summarizedText = await fetchSummarizerApi(textToSummarize);

      updatedOutput[index].summary = summarizedText;
      setOutput([...updatedOutput]);
    } catch (error) {
      console.error("Summarization failed:", error);
      updatedOutput[index].summary = "Summarization failed";
      setOutput([...updatedOutput]);
    }
  };

  // Placeholder function for calling the Summarizer API (replace with actual implementation)
  const fetchSummarizerApi = async (text) => {
    // Here, you can call the actual API to get the summary
    return `Summary: ${text.substring(0, 100)}...`; // Simulated summary
  };

  return (
    <div className="chat-wrap">
      <div className="container">
        {!apiAvailable && (
          <p style={{ color: "red" }}>
            Language Detection API is not available.
          </p>
        )}

        <div className="output-area">
          {output.map((item, index) => (
            <div key={index} className="message">
              <p>{item.text}</p>
              <small>Detected Language: {item.language}</small>

              {/* Language select dropdown next to the detected language */}
              <div>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  <option value="en">English (en)</option>
                  <option value="pt">Portuguese (pt)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="ru">Russian (ru)</option>
                  <option value="tr">Turkish (tr)</option>
                  <option value="fr">French (fr)</option>
                </select>
                <button onClick={() => handleTranslate(index)}>
                  Translate
                </button>
              </div>

              {/* Display translated text */}
              {item.translatedText && (
                <p style={{ fontStyle: "italic", color: "blue" }}>
                  Translation: {item.translatedText}
                </p>
              )}

              {/* Check if the text is more than 150 characters, then show Summarize button */}
              {item.text.length > 150 && !item.summary && (
                <button onClick={() => handleSummarize(index)}>
                  Summarize
                </button>
              )}

              {/* Display summarized text */}
              {item.summary && (
                <p style={{ fontStyle: "italic", color: "green" }}>
                  Summary: {item.summary}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="input-area">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your text here..."
          />

          <button onClick={handleSend} disabled={loading || !apiAvailable}>
            {loading ? "Detecting..." : "📨 Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
