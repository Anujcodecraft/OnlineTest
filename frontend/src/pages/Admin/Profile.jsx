import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Mail,
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Profile – Assessment Report
 * ---------------------------
 * Renders a polished, responsive report page that first highlights the student
 * name, then the test meta‑data, followed by a question‑by‑question breakdown.
 *
 * URL pattern:  /profile?assessmentId=<id>
 *   – Pulls assessmentId from query‑params (suits linking from tables)
 *   – GET http://localhost:5000/api/test/ass/:id  (adjust baseURL as needed)
 */
const Profile = () => {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ───────────────────────────────────────────── Fetch */
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data: payload } = await axios.get(
          `${import.meta.env.VITE_API_URL}api/test/ass/${assessmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        setData(payload);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };
    if (assessmentId) fetchReport();
  }, [assessmentId]);

  /* ─────────────────────────────────────────────  UI states */
  if (loading)
    return (
      <FullPageCenter>
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </FullPageCenter>
    );

  if (error)
    return (
      <FullPageCenter className="text-red-600">
        <AlertCircle className="w-10 h-10 mb-4" />
        {error}
      </FullPageCenter>
    );

  /* ─────────────────────────────────────────────  Destructure */
  const {
    test,
    userAnswers = [],
    score,
    startedAt,
    submittedAt,
    timeTaken,
    userId,
  } = data;
  const totalQuestions = test?.questions?.length || 0;
  const percent = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

  /* ─────────────────────────────────────────────  Render */
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-10">
      {/* ─── Student card */}
      <motion.section
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/10 rounded-2xl p-6 shadow-sm"
      >
        <UserIcon className="w-10 h-10 text-primary shrink-0" />
        <div>
          <h1 className="text-2xl font-semibold leading-tight">
            {userId?.name || 'Student'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>{userId?.email || 'Email not available'}</span>
          </div>
        </div>
      </motion.section>

      {/* ─── Test summary */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/60 backdrop-blur border rounded-2xl p-6 shadow-sm space-y-4"
      >
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">{test.title}</h2>
          <p className="text-gray-600 text-sm">{test.description}</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Score" value={`${score} / ${totalQuestions}`} />
          <Stat label="Percent" value={`${percent}%`} />
          <Stat label="Started" value={formatDate(startedAt)} />
          <Stat label="Submitted" value={formatDate(submittedAt)} />
          <Stat label="Time" value={`${Math.round(timeTaken)} s`} />
          <Stat label="Duration" value={`${test.duration} min`} />
        </div>
      </motion.section>

      {/* ─── Questions */}
      <section className="space-y-6">
        {test.questions.map((q, idx) => {
          const userAnsIdx = userAnswers[idx];
          const isCorrect = userAnsIdx === q.correctAnswer;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="border rounded-2xl p-5 shadow-sm"
            >
              {/* Question header */}
              <header className="flex items-start sm:items-center mb-3 gap-2">
                {isCorrect ? (
                  <CheckCircle className="text-green-600 w-5 h-5" />
                ) : (
                  <XCircle className="text-red-600 w-5 h-5" />
                )}
                <h3 className="font-semibold flex-1 leading-snug">
                  Q{idx + 1}. {q.question}
                </h3>
                <span
                  className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isCorrect ? 'Correct' : 'Wrong'}
                </span>
              </header>

              {/* Options */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isOptCorrect = optIdx === q.correctAnswer;
                  const isOptUser = optIdx === userAnsIdx;

                  const classes = [
                    'rounded-lg px-3 py-2 text-sm flex items-start',
                    isOptCorrect && 'bg-green-100 text-green-800',
                    isOptUser && !isCorrect && 'bg-red-100 text-red-800',
                    !isOptCorrect &&
                      !(isOptUser && !isCorrect) &&
                      'bg-gray-100',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <li key={optIdx} className={classes}>
                      <span className="font-mono mr-2">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {opt}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </section>

      {/* ─── Back */}
      <div className="py-8 text-center">
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 rounded-2xl bg-primary text-white hover:shadow-lg transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------- */
const Stat = ({ label, value }) => (
  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl text-center">
    <p className="text-xs text-gray-500 tracking-wide">{label}</p>
    <p className="text-lg font-semibold break-all">{value}</p>
  </div>
);

const formatDate = (d) => new Date(d).toLocaleString();

const FullPageCenter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-center h-screen ${className}`}>{children}</div>
);

export default Profile;
