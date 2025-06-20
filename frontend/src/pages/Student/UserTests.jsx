import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // adjust path if different
import { Loader2, AlertCircle, Clock, Target, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * UserTests – Enhanced UI with Better Visual Design
 * ------------------------------------------------
 * Shows every attempt the student has taken, with improved styling,
 * better visual hierarchy, and enhanced user experience.
 */
const UserTests = () => {
  const { user } = useAuth();
  let token = user?.token
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ────────────────────────────────────── Fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/test/user/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const assessments = (data.data || []).sort(
          (a, b) => new Date(b.startedAt) - new Date(a.startedAt),
        );
        setItems(assessments);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id && token) fetchData();
  }, [user?.id, token]);

  /* ────────────────────────────────────── Helper Functions */
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  /* ────────────────────────────────────── States */
  if (loading)
    return (
      <LoadingState>
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Loading your test attempts...</p>
      </LoadingState>
    );

  if (error)
    return (
      <ErrorState>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Unable to Load Tests</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </ErrorState>
    );

  if (!items.length)
    return (
      <EmptyState>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Test Attempts Yet</h3>
          <p className="text-gray-500">Your completed tests will appear here once you start taking them.</p>
        </div>
      </EmptyState>
    );

  /* ────────────────────────────────────── Render */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Test Attempts</h1>
          <p className="text-gray-600">Review your performance and track your progress</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-white px-3 py-1 rounded-full border">
              {items.length} attempt{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((ass, idx) => {
            const test = ass.testId || {};
            const totalQuestions = test.questions?.length || 0;
            const scorePct = totalQuestions > 0 
              ? Math.round((ass.score / totalQuestions) * 100) 
              : 0;

            return (
              <motion.article
                key={ass._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: idx * 0.08,
                  duration: 0.5,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header with Color Accent */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <div className="p-6">
                  {/* Test Title and Code */}
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {test.title || 'Untitled Test'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-mono px-3 py-1 rounded-full">
                        {test.testCode || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(ass.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    {/* Score */}
                    <StatCard
                      icon={<Target className="w-4 h-4" />}
                      label="Score"
                      value={`${ass.score}/${totalQuestions}`}
                      percentage={scorePct}
                      colorClass={getScoreColor(scorePct)}
                    />
                    
                    {/* Time */}
                    <StatCard
                      icon={<Clock className="w-4 h-4" />}
                      label="Time Taken"
                      value={formatTime(ass.timeTaken)}
                      colorClass="text-blue-600 bg-blue-50 border-blue-200"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/profile?assessmentId=${ass._id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 group-hover:shadow-lg"
                  >
                    View Detailed Results
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Helper Components */
/* ---------------------------------------------------------------------- */

const StatCard = ({ icon, label, value, percentage, colorClass }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg border ${colorClass}`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-right">
      <div className="font-bold">{value}</div>
      {percentage !== undefined && (
        <div className="text-xs opacity-75">{percentage}%</div>
      )}
    </div>
  </div>
);

const LoadingState = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center">{children}</div>
  </div>
);

const ErrorState = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">{children}</div>
  </div>
);

const EmptyState = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">{children}</div>
  </div>
);

export default UserTests;