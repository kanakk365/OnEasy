import React, { useState, useEffect, useRef } from "react";
import { IoSend, IoPerson } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";

const ComplianceChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "👋 Hi! Let's set up your compliance requirements.\nWhat is the name of your organisation?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Simple state machine for the chat flow
  const [currentStep, setCurrentStep] = useState("ask_org_name");
  const [formData, setFormData] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate backend response delay
    setTimeout(() => {
      processResponse(text);
    }, 1000);
  };

  const processResponse = (userInput) => {
    let nextStep = currentStep;
    let botResponses = [];
    let nextOptions = null;

    switch (currentStep) {
      case "ask_org_name":
        setFormData((prev) => ({ ...prev, orgName: userInput }));
        botResponses.push({ text: "Got it 👍" });
        botResponses.push({
          text: "What is the nature of your business?",
          options: ["Manufacturing", "Service oriented", "Restaurants"],
        });
        nextStep = "ask_nature";
        break;

      case "ask_nature":
        setFormData((prev) => ({ ...prev, nature: userInput }));
        botResponses.push({ text: `Understood, ${userInput}.` });
        botResponses.push({
          text: "Based on your business nature, here are the recommended compliance categories.",
          // In a real app, this would come from backend
        });
        // End of simulated flow for now, or add more steps
        nextStep = "finished";
        break;

      default:
        botResponses.push({
          text: "Thank you! We have recorded your information.",
        });
        break;
    }

    setCurrentStep(nextStep);
    setIsTyping(false);

    // Add bot messages sequentially
    botResponses.forEach((response, index) => {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + index,
            type: "bot",
            text: response.text,
            options: response.options,
          },
        ]);
      }, index * 800);
    });
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-4">
      <div className="flex bg-white items-center gap-2 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-[#E3F2F9] flex items-center justify-center">
          <RiRobot2Line className="text-[#00486D]" />
        </div>
        <span className="font-semibold text-[#00486D]">Oneasy AI</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-20 py-8 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.type === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.type === "bot" && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#00486D] ml-1">
                  Oneasy AI
                </span>
              </div>
            )}
            {msg.type === "user" && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#00486D] mr-1">
                  You
                </span>
              </div>
            )}

            <div
              className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm ${
                msg.type === "user"
                  ? "bg-[#00486D] text-white rounded-tr-none"
                  : "bg-[#F0F4F8] text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.text.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </div>

            {msg.options && (
              <div className="flex flex-wrap gap-3 mt-3">
                {msg.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    className="px-4 py-2 bg-white border border-[#00486D] text-[#00486D] rounded-full text-sm font-medium hover:bg-[#E3F2F9] transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#00486D] ml-1">
                Oneasy AI
              </span>
            </div>
            <div className="bg-[#F0F4F8] rounded-2xl rounded-tl-none px-6 py-4">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:px-20 md:py-6 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleSendMessage(inputValue)
            }
            placeholder={
              currentStep === "ask_org_name"
                ? "ABC Consulting and Co."
                : "Type your message..."
            }
            className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent shadow-sm text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2 bg-[#00486D] text-white rounded-full hover:bg-[#01334C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSend className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChat;
