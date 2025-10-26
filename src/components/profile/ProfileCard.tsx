import React from 'react';

interface ProfileCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  message?: { type: 'success' | 'error'; text: string } | null;
}

export function ProfileCard({
  title = "Información Personal",
  description = "Gestiona tu información personal y mantén tu perfil actualizado.",
  children,
  message
}: ProfileCardProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-dark-500 mb-2">
          {title}
        </h1>
        <p className="text-gray-medium-400">
          {description}
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-blue-light-50 border border-blue-light-200 text-blue-light-700'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-blue-light-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-medium-100">
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}