// src/pages/Report.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed
import { motion } from "framer-motion";

const Report = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  //   const { testId } = useParams();
  const { user } = useAuth();
  let token = null;
  if (user) {
    token = user.token;
  }
  console.log("user is in report ", user);
  const navigate = useNavigate();
  // if(!user) return;
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchtest = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/test/test/${testId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssessments(data.data ?? []);
      setLoading(false);
      //   if(data)
      //  console.log("the datat in report",data)
    } catch (error) {
      console.log(error);
    }
  };

  // console.log("the assessment is",assessments)

  useEffect(() => {
    console.log("rest isd ", testId, user);
    if (!testId) return;
    fetchtest();
  }, [testId, user]);

  const leaderboard = useMemo(() => {
    return [...assessments]
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : (a.timeTaken ?? Infinity) - (b.timeTaken ?? Infinity)
      )
      .map((entry, idx) => ({ rank: idx + 1, ...entry }));
  }, [assessments]);

  const stats = useMemo(() => {
    if (!assessments.length) return null;
    const scores = assessments.map((a) => a.score);
    const times = assessments.map((a) => a.timeTaken).filter(Boolean);
    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;

    return {
      totalAttempts: assessments.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      averageScore: Math.round(avg(scores)),
      averageTime: times.length ? Math.round(avg(times)) : null,
    };
  }, [assessments]);

  const fmtTime = (secs) =>
    secs != null ? `${Math.floor(secs / 60)}m ${secs % 60}s` : "—";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <span className="animate-pulse text-lg text-cyan-300">Loading…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-red-300">
        <p>{error}</p>
        <button
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleNavigate = (entryObj) => {
    const id = entryObj?._id;
    if (id) {
      // you can also send the whole entry in route state if you need it later
      navigate(`/profile?assessmentId=${id}`);
    }
  };

  console.log("the leaderboard is", leaderboard);
  return (
    <motion.div
      className="mx-auto max-w-5xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="mb-6 text-3xl font-extrabold text-gray-800">
        Test Report & Leaderboard
      </h1>

      {stats && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Attempts" value={stats.totalAttempts} />
          <StatCard label="Best Score" value={stats.highestScore} />
          <StatCard label="Avg. Score" value={stats.averageScore} />
          <StatCard
            label="Avg. Time"
            value={stats.averageTime != null ? fmtTime(stats.averageTime) : "—"}
          />
        </section>
      )}

      <section className="mt-10 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Time Taken</th>
              <th className="px-4 py-3">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaderboard.map((entry) => {
              const isMe = entry.userId?._id === user._id;
              return (
                <tr
                  key={entry._id}
                  className={
                    isMe
                      ? "bg-indigo-50/60 font-medium text-indigo-900"
                      : "hover:bg-gray-50/50"
                  }
                >
                  <td className="px-4 py-3">{entry.rank}</td>
                  <td
                    className="px-4 py-3 cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleNavigate(entry)}
                  >
                    {entry.userId?.name || "—"} {isMe && "(You)"}
                  </td>
                  <td className="px-4 py-3">{entry.score}</td>
                  <td className="px-4 py-3">{fmtTime(entry.timeTaken)}</td>
                  <td className="px-4 py-3">
                    {new Date(entry.submittedAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <button
        onClick={() => navigate(-1)}
        className="mt-8 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        ← Back to Tests
      </button>
    </motion.div>
  );
};

const StatCard = ({ label, value }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="rounded-xl bg-gradient-to-tr from-white to-slate-50 p-5 shadow-sm"
  >
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

export default Report;
