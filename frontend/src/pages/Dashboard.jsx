import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LeadDrawer from '../components/LeadDrawer';
import { useToast, ToastContainer } from '../components/Toast';
import { getLeads, submitLead } from '../api/client';

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZA', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function StatsCards({ leads }) {
    const total = leads.length;
    const counts = leads.reduce(
        (acc, l) => { acc[l.status] = (acc[l.status] ?? 0) + 1; return acc; },
        {}
    );

    const cards = [
        { key: 'total', label: 'Total Leads', value: total, cls: 'total' },
        { key: 'new', label: 'New', value: counts.new ?? 0, cls: 'new' },
        { key: 'contacted', label: 'Contacted', value: counts.contacted ?? 0, cls: 'contacted' },
        { key: 'converted', label: 'Converted', value: counts.converted ?? 0, cls: 'converted' },
        { key: 'lost', label: 'Lost', value: counts.lost ?? 0, cls: 'lost' },
    ];

    return (
        <div className="stats-grid">
            {cards.map((c) => (
                <div key={c.key} className={`stat-card ${c.cls}`}>
                    <span className="stat-label">{c.label}</span>
                    <span className="stat-value">{c.value}</span>
                </div>
            ))}
        </div>
    );
}

const EMPTY_FORM = { name: '', email: '', phone: '', source: 'Direct Entry', message: '' };

function AddLeadModal({ onClose, onAdded, toast }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);

    function change(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const newLead = await submitLead(form);
            toast('Lead added successfully!', 'success');
            onAdded(newLead);
            onClose();
        } catch {
            toast('Failed to add lead. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="modal-card" role="dialog" aria-modal="true" aria-label="Add New Lead">
                <div className="modal-header">
                    <span className="modal-title">➕ Add New Lead</span>
                    <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label className="form-label" htmlFor="ml-name">Full Name *</label>
                        <input id="ml-name" name="name" type="text" className="form-input"
                            placeholder="Jane Smith" value={form.name} onChange={change} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="ml-email">Email *</label>
                            <input id="ml-email" name="email" type="email" className="form-input"
                                placeholder="jane@example.com" value={form.email} onChange={change} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ml-phone">Phone</label>
                            <input id="ml-phone" name="phone" type="tel" className="form-input"
                                placeholder="+27 82 000 0000" value={form.phone} onChange={change} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="ml-source">Source</label>
                        <select id="ml-source" name="source" className="filter-select" style={{ width: '100%' }}
                            value={form.source} onChange={change}>
                            <option>Direct Entry</option>
                            <option>Website Contact Form</option>
                            <option>Google Search</option>
                            <option>Social Media</option>
                            <option>Referral</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="ml-message">Notes / Message</label>
                        <textarea id="ml-message" name="message" className="note-textarea"
                            style={{ width: '100%' }} placeholder="Any initial notes…"
                            value={form.message} onChange={change} rows={3} />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding…' : '✅ Add Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default function Dashboard() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const { toasts, toast } = useToast();

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLeads();
            setLeads(data);
        } catch {
            toast('Failed to load leads.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    function handleUpdated(updatedLead) {
        setLeads((prev) =>
            prev.map((l) => (l._id === updatedLead._id ? updatedLead : l))
        );
        if (selectedLead?._id === updatedLead._id) {
            setSelectedLead(updatedLead);
        }
        toast('Lead updated successfully!', 'success');
    }

    function handleDeleted(id) {
        setLeads((prev) => prev.filter((l) => l._id !== id));
        setSelectedLead(null);
    }

    function handleAdded(newLead) {
        setLeads((prev) => [newLead, ...prev]);
    }

    // Client-side filter (since backend returns all)
    const filtered = leads.filter((l) => {
        const matchSearch =
            !search ||
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.email.toLowerCase().includes(search.toLowerCase()) ||
            (l.source ?? '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || l.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="app-shell">
            <Sidebar />

            <main className="main-content">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="page-subtitle">
                            Manage and track all your incoming leads
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className="btn btn-ghost"
                            onClick={fetchLeads}
                            disabled={loading}
                        >
                            🔄 Refresh
                        </button>
                        <button
                            id="add-lead-btn"
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            ➕ Add Lead
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <StatsCards leads={leads} />

                {/* Toolbar */}
                <div className="toolbar">
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            id="leads-search"
                            type="text"
                            className="search-input"
                            placeholder="Search by name, email or source…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        id="status-filter"
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="spinner-wrap">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="table-card">
                        <table className="leads-table">
                            <thead>
                                <tr>
                                    <th>Lead</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="empty-state">
                                                <div className="empty-state-icon">📭</div>
                                                <div className="empty-state-title">No leads found</div>
                                                <p>Try adjusting your search or filters</p>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ marginTop: 16 }}
                                                    onClick={() => setShowAddModal(true)}
                                                >
                                                    ➕ Add Your First Lead
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((lead) => (
                                        <tr
                                            key={lead._id}
                                            onClick={() => setSelectedLead(lead)}
                                            title="Click to view details"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <div className="lead-name">{lead.name}</div>
                                                <div className="lead-email">{lead.email}</div>
                                            </td>
                                            <td>
                                                <span className="lead-source">{lead.source}</span>
                                            </td>
                                            <td>
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td>
                                                <span style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>
                                                    {lead.notes?.length ?? 0} note{lead.notes?.length !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="lead-date">{formatDate(lead.createdAt)}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {selectedLead && (
                <LeadDrawer
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                    toast={toast}
                />
            )}

            {showAddModal && (
                <AddLeadModal
                    onClose={() => setShowAddModal(false)}
                    onAdded={handleAdded}
                    toast={toast}
                />
            )}

            <ToastContainer toasts={toasts} />
        </div>
    );
}
