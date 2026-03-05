import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitLead } from '../api/client';
import { useToast, ToastContainer } from '../components/Toast';

export default function ContactForm() {
    const navigate = useNavigate();
    const { toasts, toast } = useToast();

    const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'Website Contact Form', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function change(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await submitLead(form);
            setSuccess(true);
            setForm({ name: '', email: '', phone: '', source: 'Website Contact Form', message: '' });
        } catch {
            toast('Failed to submit. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="contact-page">
            <nav className="contact-nav">
                <div className="contact-brand">
                    <span>🎯</span>
                    <span>LeadFlow CRM</span>
                </div>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate('/login')}
                >
                    Admin Login →
                </button>
            </nav>

            <main className="contact-main">
                <div className="contact-card">
                    <h1>Get in Touch</h1>
                    <p className="page-subtitle">
                        Fill in the form and our team will get back to you shortly.
                    </p>

                    {success ? (
                        <div className="success-banner">
                            <span>✅</span>
                            <div>
                                <strong>Message received!</strong>
                                <br />
                                <span style={{ fontSize: 13 }}>
                                    We'll reach out to you soon. Thank you!
                                </span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="cf-name">Full Name *</label>
                                <input
                                    id="cf-name"
                                    name="name"
                                    type="text"
                                    className="form-input"
                                    placeholder="Jane Smith"
                                    value={form.name}
                                    onChange={change}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cf-email">Email Address *</label>
                                <input
                                    id="cf-email"
                                    name="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="jane@example.com"
                                    value={form.email}
                                    onChange={change}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cf-phone">Phone Number</label>
                                <input
                                    id="cf-phone"
                                    name="phone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="+27 82 000 0000"
                                    value={form.phone}
                                    onChange={change}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cf-source">How did you find us?</label>
                                <select
                                    id="cf-source"
                                    name="source"
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                    value={form.source}
                                    onChange={change}
                                >
                                    <option>Website Contact Form</option>
                                    <option>Google Search</option>
                                    <option>Social Media</option>
                                    <option>Referral</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="cf-message">Message</label>
                                <textarea
                                    id="cf-message"
                                    name="message"
                                    className="note-textarea"
                                    style={{ width: '100%' }}
                                    placeholder="Tell us what you need…"
                                    value={form.message}
                                    onChange={change}
                                    rows={4}
                                />
                            </div>

                            <button
                                id="contact-submit"
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                                disabled={loading}
                            >
                                {loading ? 'Sending…' : '🚀  Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <ToastContainer toasts={toasts} />
        </div>
    );
}
