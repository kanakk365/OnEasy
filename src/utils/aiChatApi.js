import { AUTH_CONFIG } from '../config/auth';

const COMPLIANCE_BASE_URL = 'https://oneasycompliance.oneasy.ai';

const getToken = () => localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});


export const getSessions = async () => {
  const res = await fetch(`${COMPLIANCE_BASE_URL}/compliance-chat/sessions`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
};


export const getSessionMessages = async (sessionId, page = 1, limit = 20) => {
  const res = await fetch(
    `${COMPLIANCE_BASE_URL}/compliance-chat/sessions/${sessionId}/messages?page=${page}&limit=${limit}`,
    { method: 'GET', headers: getHeaders() }
  );
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
};


export const streamQuestion = async (question, sessionId, orgId) => {
  const body = { question, sessionId };
  if (orgId) body.orgId = String(orgId);
  const res = await fetch(`${COMPLIANCE_BASE_URL}/compliance-chat/stream`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res;
};

