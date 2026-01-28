import { Phone, Mail, Globe, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import type { Card } from '@/lib/types';

interface TemplateProps {
  data: Partial<Card>;
}

export function TemplateModern({ data }: TemplateProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-2xl">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
        {data.avatarUrl ? (
          <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="text-4xl font-bold">{data.displayName?.charAt(0) || 'U'}</div>
        )}
      </div>

      {/* Name & Title */}
      <h2 className="text-2xl font-bold mb-1">{data.displayName || '您的名字'}</h2>
      {data.title && <p className="text-sm opacity-90 mb-1">{data.title}</p>}
      {data.company && <p className="text-xs opacity-75 mb-4">{data.company}</p>}

      {/* Contact Info */}
      <div className="w-full space-y-2 mt-4">
        {data.phone && (
          <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <Phone size={16} />
            <span>{data.phone}</span>
          </div>
        )}
        {data.email && (
          <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <Mail size={16} />
            <span className="truncate">{data.email}</span>
          </div>
        )}
        {data.website && (
          <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <Globe size={16} />
            <span className="truncate">{data.website}</span>
          </div>
        )}
      </div>

      {/* Social Links */}
      {(data.social?.instagram || data.social?.facebook || data.social?.youtube || data.social?.linkedin) && (
        <div className="flex gap-3 mt-4">
          {data.social?.instagram && (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Instagram size={18} />
            </div>
          )}
          {data.social?.facebook && (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Facebook size={18} />
            </div>
          )}
          {data.social?.youtube && (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Youtube size={18} />
            </div>
          )}
          {data.social?.linkedin && (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Linkedin size={18} />
            </div>
          )}
        </div>
      )}

      {/* Template Name Badge */}
      <div className="mt-auto pt-4">
        <span className="text-xs opacity-50">Modern 風格</span>
      </div>
    </div>
  );
}
