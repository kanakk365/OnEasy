import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import { FiSearch, FiCheck, FiX, FiFilter, FiArrowLeft } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { AUTH_CONFIG } from "../../config/auth";
import { getUsersPageData } from "../../utils/usersPageApi";

// Compliance API base URL
const COMPLIANCE_API_BASE = "https://oneasycompliance.oneasy.ai";

// 1A APIs
const API_1A_GET =
  "https://oneasycompliance.oneasy.ai/compliance/annexure-1a/available";
const API_1A_POST =
  "https://oneasycompliance.oneasy.ai/compliance/annexure-1a/my-compliances";

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

  // Manual Selection State
  const [showSelectionGrid, setShowSelectionGrid] = useState(false);
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);

  const [groupedCompliances, setGroupedCompliances] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isSubmittingSelection, setIsSubmittingSelection] = useState(false);

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
    if (!showSelectionGrid) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, showSelectionGrid]);

  // Initialize on mount
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
      // Start Custom Flow instead of immediate questionnaire
      startCustomFlow();
    }

    setIsLoading(false);
  };

  const startCustomFlow = () => {
    setMessages([
      {
        id: Date.now(),
        type: "bot",
        text: "👋 Welcome! Are you setting up for a New or Existing Business?",
        actionButtons: [
          { label: "New Business", action: "flow_new_business" },
          { label: "Existing Business", action: "flow_existing_business" },
        ],
      },
    ]);
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

        // Add intro message
        const introMsg = {
          id: Date.now(),
          type: "bot",
          text: "Let's set up your compliance requirements. I'll ask you a few questions to understand your business better.",
        };

        setMessages((prev) => [...prev, introMsg]);

        // Show first question after a delay
        setTimeout(() => {
          if (sortedFlow.length > 0) {
            showQuestion(sortedFlow[0]);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error fetching compliance flow:", error);
      setMessages((prev) => [
        ...prev,
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
    if (!text.trim() || isCompleted || showSelectionGrid) return;

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
    if (isCompleted || showSelectionGrid) return;

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

      const data = await response.json();

      // Show success message with saved count
      if (data.success) {
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
    // Record user click as message
    if (
      action !== "view_recommendations" &&
      action !== "select_compliance_type"
    ) {
      // optional: don't double log some
      // logic to find label is tricky here without passing it, but handled in specific cases below or simplified
    }

    switch (action) {
      // --- Custom Flow Actions ---
      case "flow_new_business":
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "New Business" },
        ]);
        await fetchCompleteFlow();
        break;

      case "flow_existing_business":
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "Existing Business" },
          {
            id: Date.now() + 1,
            type: "bot",
            text: "Do you know the applicable compliances for your business?",
            actionButtons: [
              { label: "Yes", action: "existing_knows_compliance" },
              { label: "No", action: "existing_no_compliance" },
            ],
          },
        ]);
        break;

      case "existing_knows_compliance":
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "Yes" },
        ]);
        // First show org selection, then compliance selection
        await fetchOrganisations();
        break;

      case "existing_no_compliance":
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "No" },
          {
            id: Date.now() + 1,
            type: "bot",
            text: "Do you want to know the applicable compliances for your business?",
            actionButtons: [
              { label: "Yes", action: "flow_new_business" }, // Re-use flow logic
            ],
          },
        ]);
        break;

      case "expert":
        window.open("https://wa.me/919876543210", "_blank");
        break;
      case "services":
        navigate("/registrations", { state: { tab: "suggested-compliances" } });
        break;
      case "view_recommendations":
        extractCompliancesFromSavedResponses(savedResponses);
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "View Recommendations" },
        ]);
        setTimeout(() => showRecommendations(), 500);
        break;
      case "update":
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "Update Responses" },
        ]);
        await resetAndStartFresh(false);
        break;
      case "delete_and_restart": {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: "user", text: "Start Fresh" },
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
        setTimeout(() => resetAndStartFresh(true), 1000);
        break;
      }
      case "restart":
        await resetAndStartFresh(true);
        break;
      case "exit_selection":
        setShowSelectionGrid(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "You exited the manual selection.",
          },
        ]);
        // maybe offer to restart?
        startCustomFlow();
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
    setShowSelectionGrid(false);
    setShowOrgSelection(false);
    setSelectedOrg(null);
    setOrganisations([]);

    // Always start with custom flow
    startCustomFlow();
  };

  // --- Manual Selection Logic ---

  const fetchOrganisations = async () => {
    setOrgLoading(true);
    try {
      const data = await getUsersPageData();
      const orgs =
        data?.data?.organisations || data?.data?.user?.organisations || [];
      if (orgs.length > 0) {
        setOrganisations(orgs);
        setShowOrgSelection(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "❌ No organisations found. Please add an organisation in Settings first.",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching organisations:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Error loading organisations. Please try again.",
        },
      ]);
    }
    setOrgLoading(false);
  };

  const handleOrgSelect = async (org) => {
    setSelectedOrg(org);
    setShowOrgSelection(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: `Selected: ${org.legal_name}${org.trade_name ? ` (${org.trade_name})` : ""}`,
      },
    ]);
    // Now fetch available compliances
    await fetchAvailableCompliances();
  };

  const fetchAvailableCompliances = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(API_1A_GET, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];

        // Group
        const grouped = {};
        const cats = new Set();
        items.forEach((item) => {
          const cat = item.category || "General";
          cats.add(cat);
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
        setGroupedCompliances(grouped);
        setCategories(["all", ...Array.from(cats)]);
        setActiveCategory("all");

        setShowSelectionGrid(true); // Switch view
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "❌ Failed to load compliance list. Please try again.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Error loading compliance list.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const toggleSelection = (code) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const toggleCategory = (cat) => {
    const items = groupedCompliances[cat] || [];
    const codes = items.map((i) => i.code);
    const allSelected = codes.every((c) => selectedCodes.includes(c));

    if (allSelected) {
      setSelectedCodes((prev) => prev.filter((c) => !codes.includes(c)));
    } else {
      setSelectedCodes((prev) => {
        const newSel = [...prev];
        codes.forEach((c) => {
          if (!newSel.includes(c)) newSel.push(c);
        });
        return newSel;
      });
    }
  };

  const submitManualSelection = async () => {
    if (selectedCodes.length === 0) return;
    setIsSubmittingSelection(true);
    try {
      const token = getAuthToken();
      const payload = {
        complianceCodes: selectedCodes,
        ...(selectedOrg ? { orgId: String(selectedOrg.id) } : {}),
      };

      const response = await fetch(API_1A_POST, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Success
        setShowSelectionGrid(false);
        const orgName = selectedOrg?.legal_name || "your business";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: `✅ Successfully assigned ${selectedCodes.length} compliance(s) to **${orgName}** dashboard!`,
          },
        ]);
        setSelectedOrg(null);
      } else {
        alert("Failed to submit compliances.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting compliances");
    }
    setIsSubmittingSelection(false);
  };

  // --- JSX ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  // --- Organisation Selection View ---
  if (showOrgSelection) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex flex-col animate-in fade-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
          <button
            onClick={() => {
              setShowOrgSelection(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  type: "bot",
                  text: "Organisation selection cancelled.",
                },
              ]);
              startCustomFlow();
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-gray-800">Select Organisation</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <p className="text-gray-500 text-sm mb-6">
            Choose the organisation you want to assign compliances to:
          </p>
          {orgLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00486D]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organisations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => handleOrgSelect(org)}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#00486D] hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#023752]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#023752]/20 transition-colors">
                      <HiOutlineBuildingOffice2 className="w-5 h-5 text-[#023752]" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-bold text-gray-900 truncate"
                        title={org.legal_name}
                      >
                        {org.legal_name}
                      </h3>
                      {org.trade_name && (
                        <p
                          className="text-sm text-gray-500 truncate mt-0.5"
                          title={org.trade_name}
                        >
                          {org.trade_name}
                        </p>
                      )}
                      {org.gstin && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          GSTIN: {org.gstin}
                        </p>
                      )}
                      {org.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-[#00486D] text-xs rounded-full">
                          {org.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Manual Selection View ---
  if (showSelectionGrid) {
    const filteredCats = categories.filter(
      (c) => c !== "all" && (activeCategory === "all" || activeCategory === c),
    );

    return (
      <div className="h-[calc(100vh-4rem)] bg-white flex flex-col animate-in fade-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowSelectionGrid(false);
                setSelectedOrg(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-gray-800">
                Select Applicable Compliances
              </h2>
              {selectedOrg && (
                <p className="text-xs text-gray-500 mt-0.5">
                  For:{" "}
                  <span className="font-medium text-[#00486D]">
                    {selectedOrg.legal_name}
                  </span>
                  {selectedOrg.trade_name ? ` (${selectedOrg.trade_name})` : ""}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-[#00486D] bg-blue-50 px-3 py-1 rounded-full">
            {selectedCodes.length} Selected
          </span>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00486D]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:border-[#00486D]"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories
                .filter((c) => c !== "all")
                .map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
            </select>
            <FiFilter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={14}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {filteredCats.map((cat) => {
            const catItems = groupedCompliances[cat].filter(
              (i) =>
                i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (i.description &&
                  i.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())),
            );
            if (catItems.length === 0) return null;

            const sectionCodes = catItems.map((i) => i.code);
            const allSelected = sectionCodes.every((c) =>
              selectedCodes.includes(c),
            );

            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                    {cat.replace(/_/g, " ")}
                  </h3>
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="text-xs text-[#00486D] hover:underline"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catItems.map((item) => {
                    const isSel = selectedCodes.includes(item.code);
                    return (
                      <div
                        key={item.code}
                        onClick={() => toggleSelection(item.code)}
                        className={`
                                                relative p-3 rounded-xl border cursor-pointer transition-all
                                                ${isSel ? "bg-[#00486D]/5 border-[#00486D]" : "bg-white border-gray-200 hover:border-gray-300"}
                                            `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSel ? "bg-[#00486D] border-[#00486D]" : "bg-white border-gray-300"}`}
                          >
                            {isSel && (
                              <FiCheck className="text-white w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${isSel ? "text-[#00486D]" : "text-gray-900"}`}
                            >
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setShowSelectionGrid(false)}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submitManualSelection}
            disabled={selectedCodes.length === 0 || isSubmittingSelection}
            className="px-8 py-2.5 rounded-lg bg-[#00486D] text-white font-medium hover:bg-[#003855] disabled:opacity-50 shadow-lg shadow-blue-900/10"
          >
            {isSubmittingSelection ? "Saving..." : "Confirm Selection"}
          </button>
        </div>
      </div>
    );
  }

  // --- Normal Chat View ---

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

      <div className="flex-1 overflow-y-auto px-4 md:px-20 py-8 space-y-6 custom-scrollbar">
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
            {msg.options && !isCompleted && !showSelectionGrid && (
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
                        : btn.action === "view_recommendations" ||
                            btn.action === "flow_new_business" ||
                            btn.action === "flow_existing_business" ||
                            btn.action === "existing_knows_compliance" ||
                            btn.action === "existing_no_compliance"
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

      <div className="bg-white p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
          placeholder="Type your answer..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#00486D] transition-colors disabled:opacity-50"
          disabled={isCompleted || isTyping || showSelectionGrid}
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={
            !inputValue.trim() || isCompleted || isTyping || showSelectionGrid
          }
          className="w-12 h-12 rounded-full bg-[#00486D] text-white flex items-center justify-center hover:bg-[#003855] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <IoSend className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default ComplianceChat;
