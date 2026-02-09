import { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
    const [cfToken, setCfToken] = useState('');
    const [cfAccountId, setCfAccountId] = useState('');
    const [newDomain, setNewDomain] = useState('');
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [nameservers, setNameservers] = useState(null);

    // Load saved credentials
    useEffect(() => {
        const savedToken = localStorage.getItem('cf_token') || '';
        const savedAccountId = localStorage.getItem('cf_account_id') || '';
        setCfToken(savedToken);
        setCfAccountId(savedAccountId);
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const response = await fetch('/api/get-domains');
            if (response.ok) {
                const data = await response.json();
                setDomains(data.domains || []);
            }
        } catch (err) {
            console.error('Failed to fetch domains:', err);
        }
    };

    const saveCredentials = () => {
        localStorage.setItem('cf_token', cfToken);
        localStorage.setItem('cf_account_id', cfAccountId);
        setMessage({ type: 'success', text: 'Credentials saved!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const addDomainWithCloudflare = async () => {
        if (!newDomain.trim()) {
            setMessage({ type: 'error', text: 'Please enter a domain name' });
            return;
        }

        if (!cfToken || !cfAccountId) {
            setMessage({ type: 'error', text: 'Please set Cloudflare credentials first' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        setNameservers(null);

        try {
            // Step 1: Add zone to Cloudflare
            const addZoneRes = await fetch('/api/cloudflare/add-zone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: newDomain.trim(),
                    cfToken,
                    cfAccountId
                })
            });

            const zoneData = await addZoneRes.json();

            if (!addZoneRes.ok) {
                throw new Error(zoneData.error || 'Failed to add zone');
            }

            // Step 2: Setup DNS records
            const setupDnsRes = await fetch('/api/cloudflare/setup-dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zoneId: zoneData.zone_id,
                    domain: newDomain.trim(),
                    cfToken
                })
            });

            const dnsData = await setupDnsRes.json();

            if (!setupDnsRes.ok) {
                throw new Error(dnsData.error || 'Failed to setup DNS');
            }

            // Step 3: Save domain to database
            const saveRes = await fetch('/api/add-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain.trim() })
            });

            if (!saveRes.ok) {
                throw new Error('Failed to save domain to database');
            }

            // Success!
            setNameservers(zoneData.nameservers);
            setMessage({
                type: 'success',
                text: `Domain "${newDomain}" added successfully!`
            });
            setNewDomain('');
            fetchDomains();

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🔐 Admin Panel</h1>
                <p>Cloudflare API Automation</p>
            </div>

            {/* Cloudflare Credentials */}
            <div className="admin-card">
                <h2>⚙️ Cloudflare Settings</h2>
                <div className="form-group">
                    <label>API Token</label>
                    <input
                        type="password"
                        placeholder="Enter Cloudflare API Token"
                        value={cfToken}
                        onChange={(e) => setCfToken(e.target.value)}
                    />
                    <small>Create at: Cloudflare → Profile → API Tokens</small>
                </div>
                <div className="form-group">
                    <label>Account ID</label>
                    <input
                        type="text"
                        placeholder="Enter Cloudflare Account ID"
                        value={cfAccountId}
                        onChange={(e) => setCfAccountId(e.target.value)}
                    />
                    <small>Found in: Cloudflare Dashboard URL</small>
                </div>
                <button className="save-btn" onClick={saveCredentials}>
                    💾 Save Credentials
                </button>
            </div>

            {/* Add Domain */}
            <div className="admin-card">
                <h2>🌐 Add Domain (Auto Setup)</h2>
                <div className="add-domain-form">
                    <input
                        type="text"
                        placeholder="example.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="add-btn"
                        onClick={addDomainWithCloudflare}
                        disabled={loading}
                    >
                        {loading ? '⏳ Processing...' : '🚀 Add & Setup'}
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {nameservers && (
                    <div className="nameservers-box">
                        <h3>📋 Update Nameservers at Your Registrar:</h3>
                        <div className="ns-list">
                            {nameservers.map((ns, i) => (
                                <code key={i}>{ns}</code>
                            ))}
                        </div>
                        <p>After updating, wait 5-30 mins for propagation.</p>
                    </div>
                )}
            </div>

            {/* Domain List */}
            <div className="admin-card">
                <h2>📁 Registered Domains ({domains.length})</h2>
                {domains.length === 0 ? (
                    <p className="empty">No domains yet</p>
                ) : (
                    <ul className="domain-list">
                        {domains.map((d) => (
                            <li key={d.id}>
                                <span className="domain-url">{d.url}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Admin;
