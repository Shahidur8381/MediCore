export default function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`rounded-full border-gray-200 border-t-blue-600 ${sizes[size]} ${className}`}
      style={{ animation: 'spin 0.7s linear infinite' }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500 font-medium">Loading MediCore...</p>
      </div>
    </div>
  );
}
