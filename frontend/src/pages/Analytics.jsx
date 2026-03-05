import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast, ToastContainer } from '../components/Toast';
import { getLeads } from '../api/client';

const STATUS_META = [
    { key: 'new', label: 'New', color: 'var(--clr-new)', bg: 'var(--clr-new-bg)' },
    { key: 'contacted', label: 'Contacted', color: 'var(--clr-contacted)', bg: 'var(--clr-contacted-bg)' },
    { key: 'converted', label: 'Converted', color: 'var(--clr-converted)', bg: 'var(--clr-converted-bg)' },
    { key: 'lost', label: 'Lost', color: 'var(--clr-lost)', bg: 'var(--clr-lost-bg)' },
];

const SOURCE_COLORS = ['#6c63ff', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export default function Analytics() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toasts, toast } = useToast();

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getLeads();
            setLeads(data);
        } catch {
            toast('Failed to load analytics data.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    // Compute stats
    const total = leads.length;
    const counts = leads.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] ?? 0) + 1;
        return acc;
    }, {});
    const conversionRate = total > 0 ? ((counts.converted ?? 0) / total * 100).toFixed(1) : '0.0';

    // Source breakdown
    const sourceCounts = leads.reduce((acc, l) => {
        const src = l.source || 'Unknown';
        acc[src] = (acc[src] ?? 0) + 1;
        return acc;
    }, {});
    const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
    const topSource = sortedSources[0]?.[0] ?? '—';

    // Most recent 7 days lead volume
    const now = Date.now();
    const DAY_MS = 86_400_000;
    const dayLabels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now - (6 - i) * DAY_MS);
        return d.toLocaleDateString('en-ZA', { weekday: 'short' });
    });
    const dayCounts = Array.from({ length: 7 }, (_, i) => {
        const start = new Date(now - (6 - i) * DAY_MS);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return leads.filter((l) => {
            const d = new Date(l.createdAt);
            return d >= start && d <= end;
        }).length;
    });
    const maxDay = Math.max(...dayCounts, 1);

    return (
        <div className="app-shell">
            <Sidebar />

            <main className="main-content">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Analytics</h1>
                        <p className="page-subtitle">Visual breakdown of your lead pipeline</p>
                    </div>
                    <button className="btn btn-ghost" onClick={fetchLeads} disabled={loading}>
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="spinner-wrap"><div className="spinner" /></div>
                ) : (
                    <>
                        {/* KPI Row */}
                        <div className="analytics-kpi-row">
                            <div className="analytics-kpi-card">
                                <span className="stat-label">Total Leads</span>
                                <span className="analytics-kpi-value" style={{ color: '#c4b5fd' }}>{total}</span>
                            </div>
                            <div className="analytics-kpi-card">
                                <span className="stat-label">Conversion Rate</span>
                                <span className="analytics-kpi-value" style={{ color: 'var(--clr-converted)' }}>{conversionRate}%</span>
                            </div>
                            <div className="analytics-kpi-card">
                                <span className="stat-label">Top Source</span>
                                <span className="analytics-kpi-value" style={{ color: 'var(--clr-primary)', fontSize: 20 }}>{topSource}</span>
                            </div>
                            <div className="analytics-kpi-card">
                                <span className="stat-label">Converted</span>
                                <span className="analytics-kpi-value" style={{ color: 'var(--clr-converted)' }}>{counts.converted ?? 0}</span>
                            </div>
                        </div>

                        {/* Status Bar Chart */}
                        <div className="analytics-card">
                            <p className="drawer-section-label" style={{ marginBottom: 20 }}>Lead Status Breakdown</p>
                            <div className="analytics-bars">
                                {STATUS_META.map(({ key, label, color, bg }) => {
                                    const count = counts[key] ?? 0;
                                    const pct = total > 0 ? (count / total * 100).toFixed(1) : 0;
                                    return (
                                        <div key={key} className="analytics-bar-row">
                                            <div className="analytics-bar-label">
                                                <span style={{ color }}>{label}</span>
                                                <span className="analytics-bar-count">{count}</span>
                                            </div>
                                            <div className="analytics-bar-track">
                                                <div
                                                    className="analytics-bar-fill"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: color,
                                                        boxShadow: `0 0 12px ${color}55`,
                                                    }}
                                                />
                                            </div>
                                            <span className="analytics-bar-pct">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Weekly Activity + Source Breakdown side by side */}
                        <div className="analytics-two-col">
                            {/* 7-day bar chart */}
                            <div className="analytics-card">
                                <p className="drawer-section-label" style={{ marginBottom: 20 }}>New Leads — Last 7 Days</p>
                                <div className="analytics-week-chart">
                                    {dayCounts.map((count, i) => (
                                        <div key={i} className="analytics-day-col">
                                            <span className="analytics-day-count">{count > 0 ? count : ''}</span>
                                            <div className="analytics-day-bar-track">
                                                <div
                                                    className="analytics-day-bar-fill"
                                                    style={{ height: `${(count / maxDay) * 100}%` }}
                                                />
                                            </div>
                                            <span className="analytics-day-label">{dayLabels[i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Source breakdown */}
                            <div className="analytics-card">
                                <p className="drawer-section-label" style={{ marginBottom: 20 }}>Leads by Source</p>
                                {sortedSources.length === 0 ? (
                                    <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>No data yet.</p>
                                ) : (
                                    <div className="analytics-source-list">
                                        {sortedSources.map(([src, cnt], idx) => {
                                            const pct = total > 0 ? (cnt / total * 100).toFixed(0) : 0;
                                            return (
                                                <div key={src} className="analytics-source-row">
                                                    <div className="analytics-source-dot" style={{ background: SOURCE_COLORS[idx % SOURCE_COLORS.length] }} />
                                                    <div className="analytics-source-info">
                                                        <div className="analytics-source-name">{src}</div>
                                                        <div className="analytics-source-bar-track">
                                                            <div
                                                                className="analytics-source-bar-fill"
                                                                style={{
                                                                    width: `${pct}%`,
                                                                    background: SOURCE_COLORS[idx % SOURCE_COLORS.length],
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="analytics-source-count">{cnt}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            <ToastContainer toasts={toasts} />
        </div>
    );
}
