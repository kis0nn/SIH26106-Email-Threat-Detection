import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, ChevronRight, Loader2, Filter } from 'lucide-react';
import { getApiBase } from '../api';

const HistoryPage = ({ onSelectAnalysis }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [fetchingAnalysis, setFetchingAnalysis] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const base = getApiBase();
      const riskParam = filter === 'All' ? '' : filter.toLowerCase();
      const response = await axios.get(`${base}/history`, {
        params: {
          limit: 20,
          offset: 0,
          risk_level: riskParam,
          search: search
        }
      });
      // Assuming response.data is the array or response.data.items
      setHistory(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filter, search]);

  const handleViewAnalysis = async (id) => {
    try {
      setFetchingAnalysis(id);
      const base = getApiBase();
      const response = await axios.get(`${base}/analysis/${id}`);
      if (onSelectAnalysis) {
        onSelectAnalysis(response.data);
      }
    } catch (error) {
      console.error("Error fetching analysis details:", error);
    } finally {
      setFetchingAnalysis(null);
    }
  };

  const getScoreBadge = (score) => {
    const numScore = parseFloat(score) || 0;
    if (numScore >= 0.7) return 'bg-rose-100 text-rose-800';
    if (numScore >= 0.4) return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search subject or sender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
          {['All', 'High', 'Medium', 'Low'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <Search className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg">No records found</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.map((item) => (
              <li key={item.id} className="hover:bg-gray-50 transition-colors">
                <div className="p-4 sm:px-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {item.sender_email || item.sender || 'Unknown Sender'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>{formatDate(item.timestamp || item.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base text-gray-900 truncate font-medium">
                        {item.subject || 'No Subject'}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getScoreBadge(item.fraud_score || item.score)}`}>
                        Score: {item.fraud_score !== undefined ? item.fraud_score : (item.score || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleViewAnalysis(item.id)}
                      disabled={fetchingAnalysis === item.id}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {fetchingAnalysis === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          View Analysis
                          <ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
