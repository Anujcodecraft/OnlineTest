// src/pages/PastTest.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';   // adjust path if needed
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';


const PastTest = () => {
  const { user } = useAuth();  // expects user._id + token (JWT)
  let token=null;
  if(user){
    token = user.token;
  }
  console.log("user is ", user, token)
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const navigate = useNavigate();

  /* ─── Fetch tests created by the logged‑in user ────────────────── */
  useEffect(() => {
    if (!user?.id ) return;  // wait until auth ready
    console.log(user.id)
   
    const source = axios.CancelToken.source();
    (async () => {
      try {
        const  data  = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/test/creator/${user.id}`,           // backend route
          {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: source.token,
          }
        );
        console.log("the data is",data)
        setTests(data ?? []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(
            'Failed to fetch past tests:',
            err?.response?.data || err.message
          );
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => source.cancel();  // cleanup on unmount
  }, [user?.id, token]);

  /* ─── UI ───────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <span className="animate-pulse text-lg text-cyan-300">Loading…</span>
      </div>
    );
  }

  console.log("the user",tests)

  return (
    <>
 
  
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Tests</h2>

    {tests?.data?.length ? (
      <ul className="space-y-5">
        {tests.data.map((test, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-gradient-to-r from-white to-slate-100 border border-gray-200 rounded-2xl shadow-sm px-6 py-5 hover:shadow-lg transition-all duration-200"
          >
            <div>
              <p className="text-xl font-bold text-gray-900">{test.title}</p>
              <p className="text-sm text-gray-600 mt-1">Test Code: <span className="font-medium text-gray-800">{test.testCode}</span></p>
            </div>

            <button
              type="button"
              onClick={()=>navigate(`/admin/Report?testId=${test._id}`)}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              // onClick={() => navigate(`/report/${test.testCode}`)}
            >
              Show Report
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No tests available.</p>
    )}
  </div>

    </>
  );
};

export default PastTest;
