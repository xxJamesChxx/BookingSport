export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <svg
        className="animate-spin"
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
      >
        <circle
          cx="26" cy="26" r="22"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <path
          d="M26 4a22 22 0 0 1 22 22"
          stroke="#1677ff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm text-gray-400">รอสักครู่...</p>
    </div>
  );
}