import React from 'react';
import Image from 'next/image';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "Không tìm thấy kết quả", 
  description = "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.", 
  icon = "https://img.icons8.com/ios/100/b6b3c0/search--v1.png" 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f3f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Image src={icon} alt="" width={32} height={32} style={{ opacity: 0.7 }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f1d29', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#8a879a', maxWidth: '280px' }}>{description}</p>
    </div>
  );
};
