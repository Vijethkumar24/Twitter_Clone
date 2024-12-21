const LoadingSpinner = ({ size = "md" }) => {
  // Map size prop to Tailwind classes
  const sizeMap = {
    sm: "w-8 h-8 text-2xl",
    md: "w-16 h-16 text-4xl",
    lg: "w-24 h-24 text-6xl",
  };

  // Get size class from the map
  const sizeClass = sizeMap[size] || sizeMap.md; // Default to "md" if size not found

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative">
        {/* Spinner */}
        <div
          className={`animate-spin border-t-4 border-blue-500 border-solid rounded-full ${sizeClass}`}
        ></div>

        {/* "X" Symbol */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-blue-500 font-bold animate-pulse`}
        >
          X
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
