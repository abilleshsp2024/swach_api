import React, { useState, useEffect } from 'react';
import { fetchTotalList } from '../services/api';

const TotalListView = ({ onBack }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchTotalList();
                setItems(data);
            } catch (err) {
                setError('Failed to load records. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="total-list-view">
            <div className="list-view-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h2>Total List</h2>
                <span className="record-count">{items.length} records</span>
            </div>

            {loading && (
                <div className="list-loading">
                    <div className="spinner"></div>
                    <p>Loading records...</p>
                </div>
            )}

            {error && (
                <div className="error-message">{error}</div>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="list-empty">
                    <div className="empty-icon">📋</div>
                    <p>No records found in the database.</p>
                </div>
            )}

            {!loading && !error && items.length > 0 && (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Swach Code</th>
                                <th>Status</th>
                                <th>Swatch Path</th>
                                <th>Model Path</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.s_no}>
                                    <td>{item.s_no}</td>
                                    <td><span className="code-badge">{item.swach_code}</span></td>
                                    <td>
                                        <span className={`status-pill ${item.status?.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="path-cell" title={item.swatch_path}>
                                        {item.swatch_path ? item.swatch_path.split('\\').pop() : '—'}
                                    </td>
                                    <td className="path-cell" title={item.model_path}>
                                        {item.model_path ? item.model_path.split('\\').pop() : '—'}
                                    </td>
                                    <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TotalListView;
