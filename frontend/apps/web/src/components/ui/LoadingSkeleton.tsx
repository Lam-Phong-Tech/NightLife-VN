import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse" style={{ display: 'flex', gap: '12px', background: '#fff', borderRadius: '14px', padding: '12px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: '#f3f2f5', flex: 'none' }}></div>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <div style={{ width: '70%', height: '14px', borderRadius: '4px', background: '#f3f2f5' }}></div>
            <div style={{ width: '40%', height: '12px', borderRadius: '4px', background: '#f3f2f5' }}></div>
            <div style={{ width: '20%', height: '12px', borderRadius: '4px', background: '#f3f2f5', marginTop: '8px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
