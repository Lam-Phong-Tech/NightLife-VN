"use client";

import React, { useState, useEffect } from 'react';
import { Info, X, Check, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

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
  goldBright: '#e3c27e',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  blue: '#60a5fa',
  blueBg: 'rgba(96,165,250,0.1)',
};

const bills = [
  { 
    id: 'BILL-8842', 
    store: 'Sakura Lounge', 
    location: 'Hoàn Kiếm', 
    amount: '12.500.000đ', 
    date: '30/06/2026', 
    sender: 'Khách', 
    hasImage: true, 
    status: 'Chờ duyệt',
    guestType: 'Member',
    discount: '1.000.000đ',
    discountPercent: 8,
    commissionPercent: 15,
    adminCommission: '875.000đ',
    points: '+120 điểm'
  },
  { id: 'BILL-8841', store: 'Club Lumière', location: 'Tây Hồ', amount: '8.200.000đ', date: '30/06/2026', sender: 'Chủ quán', hasImage: true, status: 'Chờ duyệt', guestType: 'Normal', discount: '0', discountPercent: 0, commissionPercent: 10, adminCommission: '820.000đ', points: '+82 điểm' },
  { id: 'BILL-8840', store: 'KTV Hoàng Gia', location: 'Kim Mã', amount: '15.800.000đ', date: '29/06/2026', sender: 'Khách', hasImage: false, status: 'Chờ duyệt', guestType: 'Guest', discount: '500.000đ', discountPercent: 5, commissionPercent: 15, adminCommission: '1.580.000đ', points: '+158 điểm' },
  { id: 'BILL-8839', store: 'Bar Tokyo Night', location: 'Ba Đình', amount: '6.400.000đ', date: '29/06/2026', sender: 'Khách', hasImage: true, status: 'Chờ duyệt', guestType: 'Normal', discount: '0', discountPercent: 0, commissionPercent: 10, adminCommission: '640.000đ', points: '+64 điểm' },
  { id: 'BILL-8838', store: 'Akari Lounge', location: 'Tây Hồ', amount: '5.300.000đ', date: '28/06/2026', sender: 'Chủ quán', hasImage: true, status: 'Chờ duyệt', guestType: 'Member', discount: '530.000đ', discountPercent: 10, commissionPercent: 15, adminCommission: '265.000đ', points: '+53 điểm' }
];

export default function AdminBillsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustomReason, setRejectCustomReason] = useState('');
  const [rejectBillId, setRejectBillId] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveBillId, setApproveBillId] = useState('');

  const fetchBills = async () => {
    try {
      const res = await apiClient<any>('/admin/bills', {
        params: { status: activeTab }
      });
      setBills(res.data);
      setStats(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveClick = (billId: string) => {
    setApproveBillId(billId);
    setShowApproveModal(true);
  };

  const handleApproveSubmit = async () => {
    setIsProcessing(true);
    try {
      await apiClient(`/admin/bills/${approveBillId}/status`, { method: 'PUT', data: { status: 'VERIFIED' } });
      fetchBills();
      setShowApproveModal(false);
      setSelectedBill(null);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi duyệt bill');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (billId: string) => {
    setRejectBillId(billId);
    setRejectReason('Ảnh mờ/không rõ');
    setRejectCustomReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    const finalReason = rejectReason === 'Khác' ? rejectCustomReason : rejectReason;
    if (!finalReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    
    setIsProcessing(true);
    try {
      await apiClient(`/admin/bills/${rejectBillId}/status`, { method: 'PUT', data: { status: 'REJECTED', reason: finalReason } });
      setShowRejectModal(false);
      fetchBills();
      setSelectedBill(null);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi từ chối bill');
    } finally {
      setIsProcessing(false);
    }
  };


  useEffect(() => {
    fetchBills();
  }, [activeTab]);

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TOP FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px', border: `1px solid ${colors.borderSoft}` }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{
              background: activeTab === 'pending' ? colors.goldGrad : 'transparent',
              color: activeTab === 'pending' ? colors.onGold : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'pending' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Chờ duyệt {stats?.pendingCount ?? 0}
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            style={{
              background: activeTab === 'approved' ? colors.surface2 : 'transparent',
              color: activeTab === 'approved' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'approved' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Đã duyệt {stats?.approvedCount ?? 0}
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            style={{
              background: activeTab === 'rejected' ? colors.surface2 : 'transparent',
              color: activeTab === 'rejected' ? colors.text : colors.muted,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: activeTab === 'rejected' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Từ chối {stats?.rejectedCount ?? 0}
          </button>
        </div>

        <div style={{ 
          background: 'rgba(212,178,106,.05)', 
          border: `1px solid ${colors.borderGold22}`, 
          borderRadius: '8px', 
          padding: '8px 16px',
          color: colors.gold,
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>$</span> Chờ duyệt: ≈ {(stats?.totalAmountPending ?? 0).toLocaleString('vi-VN')}đ
        </div>
      </div>

      {/* INFO BANNER */}
      <div style={{ 
        background: colors.blueBg, 
        border: `1px solid rgba(96,165,250,0.2)`, 
        borderRadius: '8px', 
        padding: '12px 16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: colors.blue,
        fontSize: '13px'
      }}>
        <Info size={16} />
        <span>
          Duyệt thủ công bằng mắt. <strong>Hoa hồng = Bill gốc × (% hoa hồng - % giảm giá)</strong> - Điểm = 1.000.000đ = 10 điểm trên bill gốc. Bill mờ/sai → từ chối kèm lý do.
        </span>
      </div>

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>MÃ BILL</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>SỐ TIỀN (GỘP)</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGÀY DV</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGƯỜI GỬI</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'center' }}>ẢNH</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'right' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, idx) => (
              <tr 
                key={idx} 
                onClick={() => setSelectedBill(bill)}
                style={{ 
                  borderBottom: `1px solid ${colors.borderSoft}`,
                  cursor: 'pointer',
                  background: selectedBill?.id === bill.id ? colors.surface2 : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedBill?.id === bill.id ? colors.surface2 : 'transparent'}
              >
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{bill.billNumber || bill.id}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{bill.store || 'N/A'}</div>
                  <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{bill.location || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, color: colors.text }}>{bill.amount?.toLocaleString('vi-VN')}đ</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{bill.date ? new Date(bill.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{bill.sender || 'N/A'}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  {bill.hasImage ? (
                    <span style={{ 
                      background: colors.greenBg, 
                      color: colors.green, 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: 600,
                      border: `1px solid ${colors.green}40`
                    }}>Có</span>
                  ) : (
                    <span style={{ color: colors.muted, fontSize: '14px', fontWeight: 600 }}>—</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <span style={{ 
                    border: `1px solid ${colors.borderGold22}`, 
                    color: colors.gold, 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: 'rgba(212,178,106,.05)'
                  }}>
                    {bill.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIDE DRAWER (Modal) */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: selectedBill ? 0 : '-400px',
        bottom: 0,
        width: '400px',
        background: colors.bg,
        borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: selectedBill ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedBill && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.muted, marginBottom: '8px' }}>
                    HÓA ĐƠN · {selectedBill.id}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: '0 0 16px 0' }}>{selectedBill.store}</h2>
                  <span style={{ 
                    border: `1px solid ${colors.borderGold22}`, 
                    color: colors.gold, 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: 'rgba(212,178,106,.05)'
                  }}>
                    {selectedBill.status}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedBill(null)}
                  style={{
                    width: 32, height: 32, borderRadius: '8px', 
                    background: colors.surface2, color: colors.muted, 
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {/* Image Placeholder */}
              <div style={{ 
                height: 200, 
                borderRadius: '12px', 
                border: `1px dashed ${colors.borderSoft}`, 
                background: colors.surface1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.muted,
                marginBottom: '32px'
              }}>
                <ImageIcon size={24} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px' }}>Ảnh hóa đơn đính kèm</span>
              </div>

              {/* Basic Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Ngày dùng dịch vụ</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 600 }}>{selectedBill.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Người gửi</span>
                <span style={{ color: colors.text, fontSize: '14px', fontWeight: 600 }}>{selectedBill.sender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '24px', marginBottom: '8px' }}>
                <span style={{ color: colors.muted, fontSize: '14px' }}>Hạng khách</span>
                <span style={{ 
                  background: colors.surface2, 
                  color: colors.blue, 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  border: `1px solid ${colors.borderSoft}`
                }}>{selectedBill.guestType}</span>
              </div>

              {/* Calculation Box */}
              <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.gold, marginBottom: '20px' }}>ĐỐI SOÁT & GHI NHẬN</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>Bill gốc</span>
                  <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBill.amount}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>Giảm giá ({selectedBill.discountPercent}%)</span>
                  <span style={{ color: colors.red, fontSize: '14px', fontWeight: 700 }}>– {selectedBill.discount}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>% hoa hồng thỏa thuận</span>
                  <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBill.commissionPercent}%</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: colors.gold, fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Hoa hồng Admin</div>
                    <div style={{ color: colors.muted, fontSize: '11px' }}>= {selectedBill.amount} × ({selectedBill.commissionPercent}% – {selectedBill.discountPercent}%)</div>
                  </div>
                  <span style={{ color: colors.gold, fontSize: '18px', fontWeight: 700 }}>{selectedBill.adminCommission}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.text2, fontSize: '14px' }}>Điểm tích lũy</span>
                  <span style={{ color: colors.text, fontSize: '14px', fontWeight: 700 }}>{selectedBill.points}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer - Only show if SUBMITTED */}
            {selectedBill.status === 'SUBMITTED' && (
              <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}`, display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => handleApproveClick(selectedBill.id)}
                  disabled={isProcessing}
                  style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: colors.goldGrad,
                  color: colors.onGold,
                  border: 'none',
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.7 : 1
                }}>
                  <Check size={18} strokeWidth={3} />
                  Duyệt & ghi nhận
                </button>
                <button 
                  onClick={() => handleRejectClick(selectedBill.id)}
                  disabled={isProcessing}
                  style={{
                    width: '120px',
                    background: 'transparent',
                    color: '#e0729e',
                    border: `1px solid rgba(224,114,158,.3)`,
                    height: '48px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1
                }}>
                  Từ chối
                </button>
              </div>
            )}
          </>
        )}
      </div>


      {/* REJECT MODAL */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: colors.surface1, width: '400px', borderRadius: '16px',
            border: `1px solid ${colors.borderSoft}`, padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: colors.text, fontSize: '18px' }}>Từ chối Bill</h3>
            <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '16px' }}>Vui lòng chọn lý do từ chối để thông báo cho người dùng.</p>
            
            <select 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%', height: '40px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`,
                borderRadius: '8px', color: colors.text, padding: '0 12px', fontSize: '14px', outline: 'none', marginBottom: '16px'
              }}
            >
              <option value="Ảnh mờ/không rõ">Ảnh mờ/không rõ</option>
              <option value="Sai thông tin quán">Sai thông tin quán</option>
              <option value="Hóa đơn quá hạn">Hóa đơn quá hạn</option>
              <option value="Khác">Khác...</option>
            </select>

            {rejectReason === 'Khác' && (
              <input 
                type="text" 
                placeholder="Nhập lý do khác..." 
                value={rejectCustomReason}
                onChange={(e) => setRejectCustomReason(e.target.value)}
                style={{
                  width: '100%', height: '40px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`,
                  borderRadius: '8px', color: colors.text, padding: '0 12px', fontSize: '14px', outline: 'none', marginBottom: '16px'
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '8px 16px', background: 'transparent', color: colors.text2,
                  border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleRejectSubmit}
                disabled={isProcessing}
                style={{
                  padding: '8px 16px', background: colors.red, color: '#fff',
                  border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* APPROVE MODAL */}
        {showApproveModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: colors.surface1, width: '400px', borderRadius: '16px',
              border: `1px solid ${colors.borderGold22}`, padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(212,178,106,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} color={colors.gold} />
                </div>
                <h3 style={{ margin: 0, color: colors.text, fontSize: '18px' }}>Duyệt hóa đơn</h3>
              </div>
              <p style={{ color: colors.text2, fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn duyệt hóa đơn này không? Dữ liệu doanh thu và điểm tích lũy sẽ được cập nhật ngay lập tức.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowApproveModal(false)}
                  style={{
                    padding: '8px 16px', background: 'transparent', color: colors.text2,
                    border: `1px solid ${colors.borderSoft}`, borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleApproveSubmit}
                  disabled={isProcessing}
                  style={{
                    padding: '8px 16px', background: colors.goldGrad, color: colors.onGold,
                    border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
