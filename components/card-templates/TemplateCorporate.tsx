import { Phone, Mail, Globe, Instagram, Facebook, Youtube, Linkedin, Building2 } from 'lucide-react';
import type { Card } from '@/lib/types';

interface TemplateProps {
  data: Partial<Card>;
}

export function TemplateCorporate({ data }: TemplateProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>
      
      <div className="p-6 flex flex-col h-[calc(100%-8px)]">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="text-3xl font-bold text-white">{data.displayName?.charAt(0) || 'U'}</div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-white">
            <h2 className="text-xl font-bold mb-1">{data.displayName || '您的名字'}</h2>
            {data.title && <p className="text-sm text-blue-300 mb-1">{data.title}</p>}
            {data.company && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Building2 size={12} />
                <span>{data.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Cards */}
        <div className="space-y-2 flex-1">
          {data.phone && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Phone size={14} className="text-blue-400" />
              </div>
              <span className="text-sm text-gray-300">{data.phone}</span>
            </div>
          )}
          {data.email && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Mail size={14} className="text-cyan-400" />
              </div>
              <span className="text-sm text-gray-300 truncate">{data.email}</span>
            </div>
          )}
          {data.website && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Globe size={14} className="text-teal-400" />
              </div>
              <span className="text-sm text-gray-300 truncate">{data.website}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {(data.social?.instagram || data.social?.facebook || data.social?.youtube || data.social?.linkedin) && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {data.social?.instagram && (
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Instagram size={18} className="text-white" />
              </div>
            )}
            {data.social?.facebook && (
              <div className="aspect-square rounded-lg bg-blue-600 flex items-center justify-center">
                <Facebook size={18} className="text-white" />
              </div>
            )}
            {data.social?.youtube && (
              <div className="aspect-square rounded-lg bg-red-600 flex items-center justify-center">
                <Youtube size={18} className="text-white" />
              </div>
            )}
            {data.social?.linkedin && (
              <div className="aspect-square rounded-lg bg-blue-700 flex items-center justify-center">
                <Linkedin size={18} className="text-white" />
              </div>
            )}
          </div>
        )}

        {/* Template Name Badge */}
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500">Corporate 風格</span>
        </div>
      </div>
    </div>
  );
}
