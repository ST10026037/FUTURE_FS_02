import { useState, useEffect, useRef } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    function toast(message, type = 'success') {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }

    return { toasts, toast };
}

export function ToastContainer({ toasts }) {
    return (
        <div className="toast-wrap">
            {toasts.map((t) => (
                <div key={t.id} className={`toast ${t.type}`}>
                    <span>{t.type === 'success' ? '✅' : '❌'}</span>
                    <span>{t.message}</span>
                </div>
            ))}
        </div>
    );
}
