"use client";

import React, { useState } from 'react';
import { Upload, Play } from 'lucide-react';

const colors = {
  bg: '#0f0f13',
  surface1: '#18181f',
  surface2: '#202028',
  borderSoft: 'rgba(255,255,255,.05)',
  borderGold22: 'rgba(212,178,106,.22)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
};

// Generate some mock media items
const mockMedia = Array.from({ length: 17 }).map((_, i) => ({
  id: String(i + 1),
  type: i % 4 === 1 ? 'video' : 'image', // some videos, mostly images
  color: [
    '#2c241b', '#1b1b24', '#1f2427', '#271b1e', '#1c241c', '#2c291b'
  ][i % 6]
}));

export default function AdminMediaPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');

  const filteredMedia = mockMedia.filter(m => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TABS & BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 24px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'all' ? colors.goldGrad : 'transparent',
                color: activeTab === 'all' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'all' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab('image')}
              style={{
                padding: '8px 24px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'image' ? colors.goldGrad : 'transparent',
                color: activeTab === 'image' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'image' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Ảnh
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              style={{
                padding: '8px 24px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'video' ? colors.goldGrad : 'transparent',
                color: activeTab === 'video' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'video' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Video
            </button>
          </div>
          <div style={{ fontSize: '13px', color: colors.muted, fontWeight: 500 }}>
            1.284 file · 3.2 GB
          </div>
        </div>

        <button 
          style={{
            height: '40px', display: 'flex', alignItems: 'center', gap: '8px',
            background: colors.goldGrad, color: colors.onGold, border: 'none', padding: '0 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}
        >
          <Upload size={16} strokeWidth={3} />
          Tải lên
        </button>
      </div>

      {/* MEDIA GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Upload Card - Only show in 'all' or 'image' tab depending on context, let's always show it as first item */}
        <div style={{
          aspectRatio: '1', borderRadius: '16px', border: `1px dashed ${colors.borderSoft}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: colors.muted, cursor: 'pointer', transition: 'all 0.2s', background: colors.surface1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.gold;
          e.currentTarget.style.color = colors.gold;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.borderSoft;
          e.currentTarget.style.color = colors.muted;
        }}
        >
          <Upload size={24} style={{ marginBottom: '12px' }} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Tải lên</span>
        </div>

        {/* Media Items */}
        {filteredMedia.map(item => (
          <div key={item.id} style={{
            aspectRatio: '1', borderRadius: '16px', background: item.color,
            position: 'relative', overflow: 'hidden', border: `1px solid ${colors.borderSoft}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            {item.type === 'video' && (
              <div style={{ 
                width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
              </div>
            )}
            
            <div style={{ 
              position: 'absolute', bottom: 12, left: 16, 
              fontSize: '12px', fontWeight: 700, color: colors.text,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {item.type === 'video' ? 'Video' : 'Ảnh'}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
