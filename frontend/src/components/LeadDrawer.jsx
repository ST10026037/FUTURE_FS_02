import { useState } from 'react';
import { addNote, updateStatus, deleteLead } from '../api/client';
import StatusBadge from './StatusBadge';

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-ZA', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function LeadDrawer({ lead, onClose, onUpdated, onDeleted, toast }) {
    const [status, setStatus] = useState(lead.status);
    const [savingStatus, setSavingStatus] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [notes, setNotes] = useState(lead.notes ?? []);
    const [localStatus, setLocalStatus] = useState(lead.status);
    const [deletingLead, setDeletingLead] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    async function handleStatusSave() {
        setSavingStatus(true);
        try {
            const updated = await updateStatus(lead._id, status);
            setLocalStatus(updated.status);
            onUpdated(updated);
        } catch {
            toast?.('Failed to update status.', 'error');
        } finally {
            setSavingStatus(false);
        }
    }

    async function handleAddNote(e) {
        e.preventDefault();
        if (!noteText.trim()) return;
        setSavingNote(true);
        try {
            const updated = await addNote(lead._id, noteText.trim());
            setNotes(updated.notes);
            setNoteText('');
            onUpdated(updated);
        } catch {
            toast?.('Failed to add note.', 'error');
        } finally {
            setSavingNote(false);
        }
    }

    async function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setDeletingLead(true);
        try {
            await deleteLead(lead._id);
            toast?.('Lead deleted.', 'success');
            onDeleted(lead._id);
        } catch {
            toast?.('Failed to delete lead.', 'error');
            setDeletingLead(false);
            setConfirmDelete(false);
        }
    }

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <aside className="drawer">
                <div className="drawer-header">
                    <span className="drawer-title">Lead Details</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {confirmDelete ? (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={handleDelete}
                                disabled={deletingLead}
                            >
                                {deletingLead ? 'Deleting…' : '⚠️ Confirm Delete'}
                            </button>
                        ) : (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleDelete}
                                title="Delete this lead"
                                style={{ color: 'var(--clr-danger)' }}
                            >
                                🗑️ Delete
                            </button>
                        )}
                        {confirmDelete && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Cancel
                            </button>
                        )}
                        <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
                    </div>
                </div>

                <div className="drawer-body">
                    {/* ── Contact info ───────────────────────────────── */}
                    <div>
                        <p className="drawer-section-label">Contact Info</p>
                        <div className="info-grid">
                            <div className="info-box" style={{ gridColumn: '1 / -1' }}>
                                <div className="info-box-label">Name</div>
                                <div className="info-box-value" style={{ fontSize: 16, fontWeight: 700 }}>
                                    {lead.name}
                                </div>
                            </div>
                            <div className="info-box">
                                <div className="info-box-label">Email</div>
                                <div className="info-box-value">{lead.email}</div>
                            </div>
                            <div className="info-box">
                                <div className="info-box-label">Phone</div>
                                <div className="info-box-value">
                                    {lead.phone ? (
                                        <a href={`tel:${lead.phone}`} style={{ color: 'var(--clr-primary)' }}>
                                            {lead.phone}
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--clr-text-muted)' }}>—</span>
                                    )}
                                </div>
                            </div>
                            <div className="info-box">
                                <div className="info-box-label">Source</div>
                                <div className="info-box-value">{lead.source}</div>
                            </div>
                            <div className="info-box">
                                <div className="info-box-label">Created</div>
                                <div className="info-box-value">{formatDate(lead.createdAt)}</div>
                            </div>
                            <div className="info-box">
                                <div className="info-box-label">Last Updated</div>
                                <div className="info-box-value">{formatDate(lead.updatedAt)}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Message ─────────────────────────────────────── */}
                    {lead.message && (
                        <div>
                            <p className="drawer-section-label">Message</p>
                            <div className="message-box">{lead.message}</div>
                        </div>
                    )}

                    {/* ── Status ─────────────────────────────────────── */}
                    <div>
                        <p className="drawer-section-label">Status</p>
                        <div className="status-row">
                            <StatusBadge status={localStatus} />
                            <select
                                className="status-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                                <option value="lost">Lost</option>
                            </select>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleStatusSave}
                                disabled={savingStatus || status === localStatus}
                            >
                                {savingStatus ? '…' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* ── Notes ──────────────────────────────────────── */}
                    <div>
                        <p className="drawer-section-label">Follow-up Notes ({notes.length})</p>

                        <form className="note-form" onSubmit={handleAddNote} style={{ marginBottom: 14 }}>
                            <textarea
                                className="note-textarea"
                                placeholder="Add a follow-up note…"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                style={{ alignSelf: 'flex-end' }}
                                disabled={savingNote || !noteText.trim()}
                            >
                                {savingNote ? 'Adding…' : '➕ Add Note'}
                            </button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {notes.length === 0 && (
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>
                                    No notes yet. Add the first follow-up above.
                                </p>
                            )}
                            {notes.map((note) => (
                                <div key={note._id} className="note-item">
                                    <span className="note-text">{note.text}</span>
                                    <span className="note-time">{formatDate(note.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
