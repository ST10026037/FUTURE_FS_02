import axios from 'axios';

const client = axios.create({
    baseURL: '/api',
});

// Inject auth token on every request
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('crm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-logout on 401 (expired / invalid token)
client.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('crm_token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Auth ────────────────────────────────────────────────────
export const login = (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data);

// ── Leads ───────────────────────────────────────────────────
export const getLeads = (params = {}) =>
    client.get('/leads', { params }).then((r) => r.data);

export const submitLead = (data) =>
    client.post('/leads', data).then((r) => r.data);

export const updateStatus = (id, status) =>
    client.patch(`/leads/${id}/status`, { status }).then((r) => r.data);

export const addNote = (id, text) =>
    client.post(`/leads/${id}/notes`, { text }).then((r) => r.data);

export const deleteLead = (id) =>
    client.delete(`/leads/${id}`).then((r) => r.data);

export default client;
