import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { AUTH_CONFIG } from "../../config/auth";

// Compliance API base URL
const COMPLIANCE_API_BASE = "https://oneasycompliance.oneasy.ai";

const ComplianceChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Flow state
  const [flowQuestions, setFlowQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasSavedResponses, setHasSavedResponses] = useState(false);
  const [savedResponses, setSavedResponses] = useState([]);
  const [recommendedCompliances, setRecommendedCompliances] = useState({
    registration: [],
    compliance: [],
  });

  // Get auth token
  const getAuthToken = () => {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      return token;
    } catch {
      return null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize on mount - check for existing responses first
  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeChat = async () => {
    setIsLoading(true);

    // First check if user has saved responses
    const existingResponses = await fetchSavedResponses();

    if (existingResponses && existingResponses.length > 0) {
      // User has existing responses - show them
      setSavedResponses(existingResponses);
      setHasSavedResponses(true);
      await showExistingResponses(existingResponses);
    } else {
      // No existing responses - start fresh questionnaire
      await fetchCompleteFlow();
    }

    setIsLoading(false);
  };

  // Fetch saved responses
  const fetchSavedResponses = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${COMPLIANCE_API_BASE}/compliance/responses`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.responses || [];
    } catch (error) {
      console.error("Error fetching saved responses:", error);
      return null;
    }
  };

  // Show existing responses in chat format
  const showExistingResponses = async (responses) => {
    // Also fetch flow to get compliance data
    await fetchCompleteFlowSilent();

    const welcomeMsg = {
      id: Date.now(),
      type: "bot",
      text: "👋 Welcome back! I found your previous compliance questionnaire responses. Here's a summary:",
    };
    setMessages([welcomeMsg]);

    // Build responses summary
    setTimeout(() => {
      let summaryText = "";
      responses.forEach((resp, idx) => {
        const answerValue =
          resp.answer.type === "text" ? resp.answer.value : resp.answer.label;
        summaryText += `${idx + 1}. **${resp.question}**\n   → ${answerValue}\n`;
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: summaryText.trim(),
          isSummary: true,
        },
      ]);

      // Extract compliances from saved responses
      extractCompliancesFromSavedResponses(responses);

      // Show options
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            type: "bot",
            text: "Would you like to continue with these responses or start fresh?",
            actionButtons: [
              { label: "View Recommendations", action: "view_recommendations" },
              { label: "Update Responses", action: "update" },
              { label: "Start Fresh", action: "delete_and_restart" },
            ],
          },
        ]);
        setIsCompleted(true);
      }, 800);
    }, 600);
  };

  // Extract compliances from saved responses by matching with flow data
  const extractCompliancesFromSavedResponses = (responses) => {
    responses.forEach((resp) => {
      if (resp.answer.type === "option" && resp.answer.optionId) {
        // Find the question in flow
        const question = flowQuestions.find((q) => q.key === resp.questionKey);
        if (question && question.options) {
          const option = question.options.find(
            (o) => o.id === resp.answer.optionId,
          );
          if (option && option.compliances) {
            extractCompliances(option.compliances);
          }
        }
      }
    });
  };

  // Fetch flow without showing questions (for compliance extraction)
  const fetchCompleteFlowSilent = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${COMPLIANCE_API_BASE}/compliance/flow/complete`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.flow && Array.isArray(data.flow)) {
        const sortedFlow = data.flow.sort((a, b) => a.order - b.order);
        setFlowQuestions(sortedFlow);
      }
    } catch (error) {
      console.error("Error fetching flow:", error);
    }
  };

  const fetchCompleteFlow = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${COMPLIANCE_API_BASE}/compliance/flow/complete`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch compliance flow");
      }

      const data = await response.json();

      if (data.flow && Array.isArray(data.flow)) {
        // Sort questions by order
        const sortedFlow = data.flow.sort((a, b) => a.order - b.order);
        setFlowQuestions(sortedFlow);

        // Add welcome message and first question
        const welcomeMsg = {
          id: Date.now(),
          type: "bot",
          text: "👋 Hi! Let's set up your compliance requirements. I'll ask you a few questions to understand your business better.",
        };

        setMessages([welcomeMsg]);

        // Show first question after a delay
        setTimeout(() => {
          if (sortedFlow.length > 0) {
            showQuestion(sortedFlow[0]);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error fetching compliance flow:", error);
      setMessages([
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Sorry, I couldn't load the compliance questionnaire. Please try again later.",
        },
      ]);
    }
  };

  // Delete all responses
  const deleteResponses = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${COMPLIANCE_API_BASE}/compliance/responses`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete responses");
      }

      return true;
    } catch (error) {
      console.error("Error deleting responses:", error);
      return false;
    }
  };

  const showQuestion = (question) => {
    setIsTyping(true);

    setTimeout(() => {
      const questionMsg = {
        id: Date.now(),
        type: "bot",
        text: question.text,
        questionKey: question.key,
        questionType: question.type,
        options:
          question.type === "single_select" && question.options
            ? question.options.map((opt) => ({
                id: opt.id,
                label: opt.label,
                value: opt.value,
                compliances: opt.compliances,
              }))
            : null,
      };

      setMessages((prev) => [...prev, questionMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isCompleted) return;

    const currentQuestion = flowQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Record response for text input
    const response = {
      questionKey: currentQuestion.key,
      textValue: text,
    };

    const updatedResponses = [...userResponses, response];
    setUserResponses(updatedResponses);

    // Move to next question or complete
    processNextStep(updatedResponses);
  };

  const handleOptionClick = async (option) => {
    if (isCompleted) return;

    const currentQuestion = flowQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Add user message with option label
    const userMsg = {
      id: Date.now(),
      type: "user",
      text: option.label,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Record response for select input
    const response = {
      questionKey: currentQuestion.key,
      optionId: option.id,
      selectedOption: option, // Keep full option data for compliance extraction
    };

    const updatedResponses = [...userResponses, response];
    setUserResponses(updatedResponses);

    // Extract compliances from selected option
    if (option.compliances) {
      extractCompliances(option.compliances);
    }

    // Move to next question or complete
    processNextStep(updatedResponses);
  };

  const extractCompliances = (compliances) => {
    setRecommendedCompliances((prev) => {
      const newRegistration = [...prev.registration];
      const newCompliance = [...prev.compliance];

      // Add registration compliances
      if (compliances.registration) {
        compliances.registration.forEach((comp) => {
          if (!newRegistration.find((r) => r.code === comp.code)) {
            newRegistration.push(comp);
          }
        });
      }

      // Add compliance items
      if (compliances.compliance) {
        compliances.compliance.forEach((comp) => {
          if (!newCompliance.find((c) => c.code === comp.code)) {
            newCompliance.push(comp);
          }
        });
      }

      return {
        registration: newRegistration,
        compliance: newCompliance,
      };
    });
  };

  const processNextStep = async (updatedResponses) => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < flowQuestions.length) {
      // Show confirmation message
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "Got it! 👍",
          },
        ]);
        setIsTyping(false);

        // Show next question
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => {
          showQuestion(flowQuestions[nextIndex]);
        }, 500);
      }, 600);
    } else {
      // All questions answered, submit responses
      await submitResponses(updatedResponses);
    }
  };

  const submitResponses = async (responses) => {
    setIsTyping(true);

    try {
      const token = getAuthToken();

      // Format responses for API
      const formattedResponses = responses.map((r) => ({
        questionKey: r.questionKey,
        ...(r.optionId ? { optionId: r.optionId } : { textValue: r.textValue }),
      }));

      const response = await fetch(
        `${COMPLIANCE_API_BASE}/compliance/responses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ responses: formattedResponses }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit responses");
      }

      // Parse the API response
      const data = await response.json();

      // Show success message with saved count
      if (data.success) {
        console.log("Responses saved successfully:", data);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: `✅ ${data.message || `Saved ${data.responses?.length || formattedResponses.length} response(s)`}`,
          },
        ]);
      }

      setIsCompleted(true);
      setHasSavedResponses(true);
      setTimeout(() => showCompletionMessage(), 800);
    } catch (error) {
      console.error("Error submitting responses:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Sorry, there was an error saving your responses. But don't worry, I can still show you the recommended compliances based on your answers.",
        },
      ]);
      setIsCompleted(true);
      setTimeout(() => showCompletionMessage(), 1000);
    }
  };

  const showCompletionMessage = () => {
    setIsTyping(false);

    // Completion message
    const completionMsg = {
      id: Date.now(),
      type: "bot",
      text: "🎉 Thank you for completing the questionnaire! Based on your responses, here are the recommended compliance requirements for your business:",
    };
    setMessages((prev) => [...prev, completionMsg]);

    // Show recommended compliances
    setTimeout(() => {
      showRecommendations();
    }, 800);
  };

  const showRecommendations = () => {
    const hasRegistrations = recommendedCompliances.registration.length > 0;
    const hasCompliances = recommendedCompliances.compliance.length > 0;

    if (hasRegistrations || hasCompliances) {
      let complianceText = "";

      if (hasRegistrations) {
        complianceText += "📋 **Registrations Required:**\n";
        recommendedCompliances.registration.forEach((comp, idx) => {
          complianceText += `${idx + 1}. ${comp.name}\n`;
        });
      }

      if (hasCompliances) {
        if (hasRegistrations) complianceText += "\n";
        complianceText += "📝 **Compliance Filings:**\n";
        recommendedCompliances.compliance.forEach((comp, idx) => {
          complianceText += `${idx + 1}. ${comp.name}\n`;
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: complianceText.trim(),
          isCompliances: true,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: "Based on your current business setup, you may have minimal compliance requirements. Our team will review and get back to you with specific recommendations.",
        },
      ]);
    }

    // Add action buttons
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          type: "bot",
          text: "Would you like to proceed with any of these registrations or need help with compliance filings?",
          actionButtons: [
            { label: "Talk to Expert", action: "expert" },
            { label: "View Services", action: "services" },
            { label: "Start Over", action: "restart" },
          ],
        },
      ]);
    }, 1000);
  };

  const handleActionButton = async (action) => {
    switch (action) {
      case "expert":
        // Navigate to contact or support page
        window.open("https://wa.me/919876543210", "_blank");
        break;
      case "services":
        navigate("/registrations", { state: { tab: "suggested-compliances" } });
        break;
      case "view_recommendations":
        // Extract compliances from saved responses and show
        extractCompliancesFromSavedResponses(savedResponses);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "user",
            text: "View Recommendations",
          },
        ]);
        setTimeout(() => {
          showRecommendations();
        }, 500);
        break;
      case "update":
        // Start fresh but keep context
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "user",
            text: "Update Responses",
          },
        ]);
        await resetAndStartFresh(false);
        break;
      case "delete_and_restart": {
        // Delete responses and start fresh
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "user",
            text: "Start Fresh",
          },
        ]);
        setIsTyping(true);

        const deleted = await deleteResponses();
        if (deleted) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "bot",
              text: "✅ Previous responses deleted. Let's start fresh!",
            },
          ]);
        }

        setTimeout(() => {
          resetAndStartFresh(true);
        }, 1000);
        break;
      }
      case "restart":
        // Just restart the questionnaire
        await resetAndStartFresh(true);
        break;
      default:
        break;
    }
  };

  const resetAndStartFresh = async (clearMessages = true) => {
    if (clearMessages) {
      setMessages([]);
    }
    setFlowQuestions([]);
    setCurrentQuestionIndex(0);
    setUserResponses([]);
    setIsCompleted(false);
    setHasSavedResponses(false);
    setSavedResponses([]);
    setRecommendedCompliances({ registration: [], compliance: [] });
    setIsTyping(false);
    await fetchCompleteFlow();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading compliance questionnaire...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white flex flex-col overflow-hidden">
      <div className="flex bg-white items-center gap-2 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-[#E3F2F9] flex items-center justify-center">
          <RiRobot2Line className="text-[#00486D]" />
        </div>
        <span className="font-semibold text-[#00486D]">
          Oneasy Compliance AI
        </span>
        {hasSavedResponses && (
          <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            ✓ Responses Saved
          </span>
        )}
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
                  : msg.isCompliances || msg.isSummary
                    ? "bg-gradient-to-br from-[#E3F2F9] to-[#F0F9FF] text-gray-800 rounded-tl-none border border-[#00486D]/10"
                    : "bg-[#F0F4F8] text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.text.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {line.startsWith("**") && line.endsWith("**") ? (
                    <strong>{line.replace(/\*\*/g, "")}</strong>
                  ) : line.includes("**") ? (
                    line
                      .split("**")
                      .map((part, idx) =>
                        idx % 2 === 1 ? (
                          <strong key={idx}>{part}</strong>
                        ) : (
                          part
                        ),
                      )
                  ) : (
                    line
                  )}
                </p>
              ))}
            </div>

            {/* Option buttons for single_select questions */}
            {msg.options && !isCompleted && (
              <div className="flex flex-wrap gap-3 mt-3">
                {msg.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className="px-4 py-2 bg-white border border-[#00486D] text-[#00486D] rounded-full text-sm font-medium hover:bg-[#E3F2F9] transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons at the end */}
            {msg.actionButtons && (
              <div className="flex flex-wrap gap-3 mt-3">
                {msg.actionButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionButton(btn.action)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      btn.action === "restart" ||
                      btn.action === "delete_and_restart"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : btn.action === "view_recommendations"
                          ? "bg-[#00486D] text-white hover:bg-[#01334C]"
                          : "bg-white border border-[#00486D] text-[#00486D] hover:bg-[#E3F2F9]"
                    }`}
                  >
                    {btn.label}
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

      <div className="flex-shrink-0 p-4 md:px-20 md:py-6 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleSendMessage(inputValue)
            }
            placeholder={
              isCompleted
                ? "Questionnaire completed - use the buttons above"
                : flowQuestions[currentQuestionIndex]?.type === "text"
                  ? "Type your answer..."
                  : "Select an option above or type your response..."
            }
            disabled={isCompleted}
            className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00486D] focus:border-transparent shadow-sm text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isCompleted}
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
