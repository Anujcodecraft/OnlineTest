export default function TestResult() {
  const result = JSON.parse(localStorage.getItem("result"));

  if (!result) return <div style={{ padding: "2rem" }}>No result available.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Test Result</h2>
      <p>Score: {result.score} / {result.total}</p>
    </div>
  );
}
