import { useState, useEffect } from 'react';
import './LiveTraffic.css';

const LiveTraffic = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClicks = async () => {
        try {
            const response = await fetch('/api/get-recent-clicks');
            if (response.ok) {
                const data = await response.json();
                setClicks(data.clicks || []);
            }
        } catch (err) {
            console.error('Failed to fetch clicks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClicks();
        const interval = setInterval(fetchClicks, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getCountryFlag = (country) => {
        const flags = {
            'ID': '🇮🇩',
            'US': '🇺🇸',
            'GB': '🇬🇧',
            'AU': '🇦🇺',
            'CA': '🇨🇦',
            'DE': '🇩🇪',
            'FR': '🇫🇷',
            'JP': '🇯🇵',
            'KR': '🇰🇷',
            'CN': '🇨🇳',
            'IN': '🇮🇳',
            'BR': '🇧🇷',
            'RU': '🇷🇺',
            'MY': '🇲🇾',
            'SG': '🇸🇬',
            'PH': '🇵🇭',
            'TH': '🇹🇭',
            'VN': '🇻🇳',
            'NL': '🇳🇱',
            'IT': '🇮🇹',
            'ES': '🇪🇸',
            'XX': '🌍'
        };
        return flags[country] || '🌍';
    };

    const getOSIcon = (os) => {
        const icons = {
            'iOS': '🍎',
            'Android': '🤖',
            'Windows': '🪟',
            'Windows Phone': '📱',
            'macOS': '🍏',
            'Linux': '🐧',
            'Chrome OS': '💻',
            'Unknown': '❓'
        };
        return icons[os] || '❓';
    };

    if (loading) {
        return (
            <div className="live-traffic">
                <div className="live-traffic-header">
                    <span className="live-dot"></span>
                    <h3>Live Traffic</h3>
                </div>
                <div className="traffic-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="live-traffic">
            <div className="live-traffic-header">
                <span className="live-dot"></span>
                <h3>Live Traffic</h3>
                <span className="traffic-count">{clicks.length} recent</span>
            </div>

            <div className="traffic-list">
                {clicks.length === 0 ? (
                    <div className="no-traffic">No traffic yet</div>
                ) : (
                    clicks.map((click, index) => (
                        <div
                            key={click.id}
                            className="traffic-item"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="traffic-icons">
                                <span className="traffic-flag" title={click.country}>{getCountryFlag(click.country)}</span>
                                <span className="traffic-os" title={click.os}>{getOSIcon(click.os)}</span>
                            </div>
                            <div className="traffic-info">
                                <span className="traffic-slug" title={click.clickId || click.slug}>
                                    {click.clickId || `/${click.slug}`}
                                </span>
                                <div className="traffic-meta">
                                    <span className="traffic-ip">{click.ip}</span>
                                    <span className="traffic-time">{formatTime(click.time)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveTraffic;
