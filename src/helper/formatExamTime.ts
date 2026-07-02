function formatExamTime(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(
      secs,
    ).padStart(2, "0")}s`;
  }

  return `${String(minutes).padStart(2, "0")}m ${String(secs).padStart(
    2,
    "0",
  )}s`;
}


export default formatExamTime;