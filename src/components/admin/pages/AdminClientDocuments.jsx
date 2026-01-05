import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../utils/api";
import { FiChevronLeft } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";
import { RiFileTextLine, RiBriefcase4Line } from "react-icons/ri";

function AdminClientDocuments() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadClientData();
    }
  }, [userId]);

  const loadClientData = async () => {
    try {
      setLoading(true);

      // Fetch client info
      const clientResponse = await apiClient
        .get(`/admin/clients`)
        .catch(() => ({ success: false, data: [] }));
      if (clientResponse.success && clientResponse.data) {
        const client = clientResponse.data.find((c) => c.user_id === userId);
        if (client) {
          setClientInfo(client);
        }
      }

      // Fetch personal documents
      const personalDocsResponse = await apiClient
        .get(`/users-page/personal-documents/${userId}`)
        .catch(() => ({
          success: false,
          data: {},
        }));

      const personalDocs = [];
      if (personalDocsResponse.success && personalDocsResponse.data) {
        Object.values(personalDocsResponse.data).forEach((docArray) => {
          if (Array.isArray(docArray)) {
            docArray.forEach((doc) => {
              personalDocs.push({
                name: doc.name || doc.type,
                url: doc.url,
                type: doc.type,
              });
            });
          }
        });
      }
      setPersonalDocuments(personalDocs);

      // Fetch organizations count
      const orgResponse = await apiClient
        .get(`/users-page/user-data/${userId}`)
        .catch(() => ({
          success: false,
          data: { organisations: [] },
        }));

      if (
        orgResponse.success &&
        orgResponse.data &&
        orgResponse.data.organisations
      ) {
        const validOrgs = orgResponse.data.organisations.filter((org) => {
          const hasLegalName =
            org.legal_name &&
            org.legal_name.trim() !== "" &&
            org.legal_name !== "-";
          const hasTradeName =
            org.trade_name &&
            org.trade_name.trim() !== "" &&
            org.trade_name !== "-";
          const hasGstin =
            org.gstin && org.gstin.trim() !== "" && org.gstin !== "-";
          return hasLegalName || hasTradeName || hasGstin;
        });
        setOrganizationsCount(validOrgs.length);
      } else {
        setOrganizationsCount(0);
      }
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00486D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate("/admin/documents-vault")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Client Documents
            </h1>
          </div>
          <p className="text-gray-500 italic ml-9">
            Viewing documents for{" "}
            <span className="font-medium text-gray-700">
              {clientInfo?.name || userId}
            </span>
          </p>
        </div>

        {/* Cards Grid - Matching Documents.jsx */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Documents Card */}
          <div
            onClick={() => navigate(`/admin/client-kyc/${userId}`)}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(160.12deg, #00486D 13.28%, #016599 109.67%)",
                }}
              >
                <RiFileTextLine className="w-6 h-6" />
              </div>
              <div className="text-[#00486D] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
              Personal Documents
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              Manage KYC and personal identification documents like Aadhaar,
              PAN, etc.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#00486D] group-hover:text-white font-semibold text-sm transition-colors">
                {personalDocuments.length}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                Documents
              </span>
            </div>
          </div>

          {/* Business Documents Card */}
          <div
            onClick={() => navigate(`/admin/client-organizations/${userId}`)}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 group hover:bg-[linear-gradient(180deg,#022B51_0%,#015079_100%)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(160.12deg, #00486D 13.28%, #016599 109.67%)",
                }}
              >
                <RiBriefcase4Line className="w-6 h-6" />
              </div>
              <div className="text-[#00486D] group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                <BsArrowRight className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors">
              Business Documents
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed group-hover:text-white/80 transition-colors">
              Access company documents, registrations, and compliance files
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F6FD] group-hover:bg-white/20 flex items-center justify-center text-[#00486D] group-hover:text-white font-semibold text-sm transition-colors">
                {organizationsCount}
              </div>
              <span className="text-gray-600 text-sm group-hover:text-white/80 transition-colors">
                {organizationsCount === 1 ? "Company" : "Companies"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminClientDocuments;
