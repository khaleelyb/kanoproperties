import React from 'react';
import { User } from '../types';
import { MessageCircle, Phone, Mail, Clock } from 'lucide-react';

interface HostContactCardProps {
  host: User;
  onMessageClick?: () => void;
  compact?: boolean;
}

export const HostContactCard: React.FC<HostContactCardProps> = ({
  host,
  onMessageClick,
  compact = false,
}) => {
  const whatsappLink = host.whatsappNumber
    ? `https://wa.me/${host.whatsappNumber.replace(/\D/g, '')}`
    : null;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Message via WhatsApp</p>
              {host.whatsappNumber && (
                <p className="font-mono text-sm font-semibold">{host.whatsappNumber}</p>
              )}
            </div>
          </div>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm"
            >
              Open Chat
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
      {/* Host Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={host.profilePicture || '/placeholder.svg'}
          alt={host.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{host.name}</h3>
          <p className="text-gray-600">@{host.username}</p>
          {host.responseRate && (
            <p className="text-sm text-gray-600 mt-1">
              {Math.round(host.responseRate * 100)}% Response Rate
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {host.bio && (
        <p className="text-gray-700 mb-6 text-sm leading-relaxed">{host.bio}</p>
      )}

      {/* Contact Methods */}
      <div className="space-y-3 mb-6">
        {/* WhatsApp */}
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="bg-green-500 text-white rounded-full p-2 group-hover:scale-110 transition-transform">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-700">Message on WhatsApp</p>
              <p className="text-sm text-green-600">{host.whatsappNumber}</p>
            </div>
            <span className="text-green-500 font-bold text-xl">→</span>
          </a>
        )}

        {/* Phone */}
        {host.phone && (
          <a
            href={`tel:${host.phone}`}
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="bg-blue-500 text-white rounded-full p-2 group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-700">Call</p>
              <p className="text-sm text-blue-600">{host.phone}</p>
            </div>
            <span className="text-blue-500 font-bold text-xl">→</span>
          </a>
        )}

        {/* Message Button */}
        <button
          onClick={onMessageClick}
          className="w-full flex items-center gap-3 p-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors group"
        >
          <Mail size={20} />
          <span className="font-semibold">Send Message</span>
        </button>
      </div>

      {/* Response Time Info */}
      {host.responseTime && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-3">
          <Clock size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Response Time</p>
            <p className="text-sm text-gray-600">{host.responseTime}</p>
          </div>
        </div>
      )}

      {/* Verification Badge */}
      {host.isVerified && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            <span>✓</span> Verified Host
          </span>
        </div>
      )}
    </div>
  );
};
