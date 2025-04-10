import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import './Home.css';

const API_TIMEOUT = 2000;

const Home = ({ onLogout }) => {
  const [isLoading, setIsLoading] = useState({
    generatePR: false,
    viewEntries: false,
    logout: false
  });

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [counts, setCounts] = useState({
    prCount: 0,
    poCount: 0,
    loading: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const fetchCounts = async () => {
      const endpoints = [
        {
          type: 'prCount',
          urls: [
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/entries/latest-count`,
            `http://localhost:3001/api/entries/latest-count`,
          ]
        },
        {
          type: 'poCount',
          urls: [
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/po-data/latest-count`,
            `http://localhost:3001/api/po-data/latest-count`
          ]
        }
      ];

      const getCount = async (urls, label) => {
        for (const url of urls.filter(Boolean)) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const res = await fetch(url, {
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' }
            });

            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              console.debug(`Fetched ${label} from:`, url);
              return parseInt(data.count) || 0;
            }
          } catch (err) {
            console.debug(`${label} fetch failed at ${url}:`, err.message);
          }
        }
        return 0; // fallback if all fail
      };

      try {
        const [prCount, poCount] = await Promise.all(
          endpoints.map(ep => getCount(ep.urls, ep.type))
        );

        setCounts({ prCount, poCount, loading: false });
      } catch (err) {
        console.error("Error fetching counts:", err);
        setCounts(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCounts();
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (action, callback) => {
    setIsLoading(prev => ({ ...prev, [action]: true }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(prev => ({ ...prev, [action]: false }));
    if (callback) callback();
  };

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="home-header">
        <motion.h2
          className="system-title"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          PR/PO System
        </motion.h2>
        <p className="welcome-message">Welcome to Purchase Request Portal</p>

        <div className="container mt-3">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total PRs</h6>
                  <h4 className="card-title">
                    {counts.loading ? (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      counts.prCount
                    )}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total POs</h6>
                  <h4 className="card-title">
                    {counts.loading ? (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      counts.poCount
                    )}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total IARs</h6>
                  <h4 className="card-title">
                    {counts.loading ? (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      0
                    )}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>




        <div className="datetime-container">
          <motion.div
            className="datetime-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="datetime-label">Current Date & Time</div>
            <div className="datetime-value">
              {currentDateTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }).split(', ').map((part, i) => (
                <span key={i} className="datetime-part">
                  {part}
                  {i < 2 ? ', ' : ' '}
                </span>
              ))}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentDateTime.getSeconds()}
                  className="datetime-changing"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentDateTime.toLocaleString('en-US', {
                    second: '2-digit'
                  })}
                  {' '}
                  {currentDateTime.getHours() >= 12 ? 'PM' : 'AM'}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="action-buttons">
        {[
          { action: 'generatePR', label: 'Create New PR', icon: '+', to: '/generate-pr/data-form', type: 'link', className: 'primary-action text-white bg-primary' },
          { action: 'viewEntries', label: 'View Saved PRs', icon: '≡', to: '/entries', type: 'link', className: 'secondary-action' },
          { action: 'logout', label: 'Logout', icon: '→', onClick: onLogout, type: 'button', className: 'logout-action' }
        ].map(({ action, label, icon, to, onClick, type, className }) => (
          <motion.div key={action} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {type === 'link' ? (
              <Link
                to={to}
                className={`btn-home ${className}`}
                onClick={() => handleAction(action)}
              >
                {isLoading[action] ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <span className="btn-icon">{icon}</span> {label}
                  </>
                )}
              </Link>
            ) : (
              <button
                className={`btn-home ${className}`}
                onClick={() => handleAction(action, onClick)}
              >
                {isLoading[action] ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <span className="btn-icon">{icon}</span> {label}
                  </>
                )}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Home;
