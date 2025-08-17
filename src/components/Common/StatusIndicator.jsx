'use client';

export default function StatusIndicator({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      <span className="ml-2 text-sm text-gray-600">{status}</span>
    </div>
  );
}
