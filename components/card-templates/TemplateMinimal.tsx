import { Phone, Mail, Globe, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import type { Card } from '@/lib/types';

interface TemplateProps {
  data: Partial<Card>;
}

export function TemplateMinimal({ data }: TemplateProps) {
  return (
    <div className="w-full h-full bg-white rounded-2xl p-6 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full rounded-lg object-cover" />
          ) : (
            <div className="text-2xl font-bold text-gray-400">{data.displayName?.charAt(0) || 'U'}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{data.displayName || '您的名字'}</h2>
          {data.title && <p className="text-sm text-gray-600 truncate">{data.title}</p>}
          {data.company && <p className="text-xs text-gray-400 truncate">{data.company}</p>}
        </div>
      </div>

      {/* Contact Info - Clean List */}
      <div className="space-y-3 flex-1">
        {data.phone && (
          <div className="flex items-center gap-3 text-gray-700">
            <Phone size={16} className="text-gray-400" />
            <span className="text-sm">{data.phone}</span>
          </div>
        )}
        {data.email && (
          <div className="flex items-center gap-3 text-gray-700">
            <Mail size={16} className="text-gray-400" />
            <span className="text-sm truncate">{data.email}</span>
          </div>
        )}
        {data.website && (
          <div className="flex items-center gap-3 text-gray-700">
            <Globe size={16} className="text-gray-400" />
            <span className="text-sm truncate">{data.website}</span>
          </div>
        )}
      </div>

      {/* Social Links - Bottom */}
      {(data.social?.instagram || data.social?.facebook || data.social?.youtube || data.social?.linkedin) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {data.social?.instagram && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <Instagram size={16} />
            </div>
          )}
          {data.social?.facebook && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <Facebook size={16} />
            </div>
          )}
          {data.social?.youtube && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <Youtube size={16} />
            </div>
          )}
          {data.social?.linkedin && (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <Linkedin size={16} />
            </div>
          )}
        </div>
      )}

      {/* Template Name Badge */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-400">Minimal 風格</span>
      </div>
    </div>
  );
}
