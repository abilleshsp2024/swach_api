import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSwatch, fetchSwachCount } from '../services/api';
import TotalListView from './TotalListView';

const Home = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('dashboard');
    const [counts, setCounts] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [styleCode, setStyleCode] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
    const [isUploading, setIsUploading] = useState(false);

    const loadCount = async () => {
        try {
            const data = await fetchSwachCount();
            setCounts(data.count);
        } catch (error) {
            console.error('Failed to fetch count:', error);
        }
    };

    React.useEffect(() => {
        loadCount();
    }, []);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleModelFileChange = (e) => {
        setModelFile(e.target.files[0]);
    };

    const handleSwatchUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !styleCode) {
            setUploadStatus({ type: 'error', message: 'Please provide both style code and image.' });
            return;
        }

        const formData = new FormData();
        formData.append('swach_code', styleCode);
        formData.append('file', selectedFile);
        if (modelFile) {
            formData.append('model_file', modelFile);
        }

        setIsUploading(true);
        setUploadStatus({ type: '', message: '' });

        try {
            await uploadSwatch(formData);
            setUploadStatus({ type: 'success', message: 'Swach Uploaded successfully!' });
            setStyleCode('');
            setSelectedFile(null);
            setModelFile(null);
            setTimeout(() => {
                setIsModalOpen(false);
                setUploadStatus({ type: '', message: '' });
                loadCount(); // Refresh count after modal closes
            }, 2000);
        } catch (error) {
            let errorMsg = 'Upload failed';
            if (error.detail) {
                if (typeof error.detail === 'string') {
                    errorMsg = error.detail;
                } else if (Array.isArray(error.detail)) {
                    errorMsg = error.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
                } else {
                    errorMsg = JSON.stringify(error.detail);
                }
            } else if (error.message) {
                errorMsg = error.message;
            }
            setUploadStatus({ type: 'error', message: errorMsg });
        } finally {
            setIsUploading(false);
        }
    };

    if (view === 'list') {
        return (
            <div className="home-container">
                <TotalListView onBack={() => setView('dashboard')} />
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="dashboard-grid">
                {/* Count Placed */}
                <div className="dashboard-card stat-card">
                    <div className="icon">📊</div>
                    <h3>Count Placed</h3>
                    <p className="stat-value" style={{ fontSize: '20px', color: 'red' }}>{counts}</p>

                </div>

                {/* Upload Image */}
                <div className="dashboard-card action-card" onClick={() => setIsModalOpen(true)}>
                    <div className="icon">📤</div>
                    <h3>swach upload</h3>
                    <button className="action-button">Open Upload Form</button>
                </div>

                {/* Total List */}
                <div className="dashboard-card list-card">
                    <div className="icon">📋</div>
                    <h3>Total List</h3>
                    <button className="action-button" onClick={() => setView('list')}>view all created</button>
                </div>
            </div>

            {/* Swach Upload Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content auth-card">
                        <div className="modal-header">
                            <h2>Swach Upload</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSwatchUpload}>
                            <div className="form-group">
                                <label>Style Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter Style Code"
                                    value={styleCode}
                                    onChange={(e) => setStyleCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Swatch Image</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Model Image (Optional)</label>
                                <input
                                    type="file"
                                    onChange={handleModelFileChange}
                                    accept="image/*"
                                />
                            </div>
                            {uploadStatus.message && (
                                <div className={uploadStatus.type === 'success' ? 'success-message' : 'error-message'}>
                                    {uploadStatus.message}
                                </div>
                            )}
                            <button type="submit" className="auth-button" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Upload Now'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
