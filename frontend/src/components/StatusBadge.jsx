export default function StatusBadge({ status }) {
    const labels = { new: 'New', contacted: 'Contacted', converted: 'Converted', lost: 'Lost' };
    return (
        <span className={`badge badge-${status}`}>
            {labels[status] ?? status}
        </span>
    );
}
