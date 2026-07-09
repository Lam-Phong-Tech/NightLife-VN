const fs = require('fs');
const path = 'frontend/apps/web/src/app/admin/AdminConsole.tsx';
let c = fs.readFileSync(path, 'utf8');

const stateCode = `  const [promptData, setPromptData] = useState<{ isOpen: boolean; title: string; onSubmit: (val: string) => void; onCancel: () => void } | null>(null);
  const [promptInputValue, setPromptInputValue] = useState("");`;

// Insert after `const [statusMessage, setStatusMessage] = useState<string | null>(null);`
c = c.replace(
  "const [statusMessage, setStatusMessage] = useState<string | null>(null);",
  "const [statusMessage, setStatusMessage] = useState<string | null>(null);\n" + stateCode
);

const confirmNegativeOld = `  const confirmNegativeBill = async (billId: string) => {
    const reason = window.prompt("Nhap ly do PM/BA xac nhan commission am:");
    if (!reason?.trim()) return;

    setReviewingId(billId);
    try {
      await apiClient(\`/admin/sensitive-bills/\${billId}/confirm-negative-commission\`, {
        method: "PATCH",
        data: { reason: reason.trim() },
      });
      setStatusMessage("Da xac nhan PM/BA va duyet bill commission am.");
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong confirm duoc bill.");
    } finally {
      setReviewingId(null);
    }
  };`;

const confirmNegativeNew = `  const confirmNegativeBill = async (billId: string) => {
    setPromptInputValue("");
    setPromptData({
      isOpen: true,
      title: "Nhap ly do PM/BA xac nhan commission am:",
      onCancel: () => setPromptData(null),
      onSubmit: async (reason) => {
        setPromptData(null);
        if (!reason?.trim()) return;
        setReviewingId(billId);
        try {
          await apiClient(\`/admin/sensitive-bills/\${billId}/confirm-negative-commission\`, {
            method: "PATCH",
            data: { reason: reason.trim() },
          });
          setStatusMessage("Da xac nhan PM/BA va duyet bill commission am.");
          await loadAdminData();
        } catch (error) {
          setStatusMessage(error instanceof ApiError ? error.message : "Khong confirm duoc bill.");
        } finally {
          setReviewingId(null);
        }
      }
    });
  };`;

c = c.replace(confirmNegativeOld, confirmNegativeNew);

const voidBillOld = `  const voidBill = async (billId: string) => {
    const reason = window.prompt("Nhap ly do void/refund bill:");
    if (!reason?.trim()) return;

    setReviewingId(billId);
    try {
      await apiClient(\`/admin/sensitive-bills/\${billId}/void\`, {
        method: "PATCH",
        data: { reason: reason.trim() },
      });
      setStatusMessage("Da void bill va reverse diem neu bill da cong diem.");
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong void duoc bill.");
    } finally {
      setReviewingId(null);
    }
  };`;

const voidBillNew = `  const voidBill = async (billId: string) => {
    setPromptInputValue("");
    setPromptData({
      isOpen: true,
      title: "Nhap ly do void/refund bill:",
      onCancel: () => setPromptData(null),
      onSubmit: async (reason) => {
        setPromptData(null);
        if (!reason?.trim()) return;
        setReviewingId(billId);
        try {
          await apiClient(\`/admin/sensitive-bills/\${billId}/void\`, {
            method: "PATCH",
            data: { reason: reason.trim() },
          });
          setStatusMessage("Da void bill va reverse diem neu bill da cong diem.");
          await loadAdminData();
        } catch (error) {
          setStatusMessage(error instanceof ApiError ? error.message : "Khong void duoc bill.");
        } finally {
          setReviewingId(null);
        }
      }
    });
  };`;

c = c.replace(voidBillOld, voidBillNew);

const modalHtml = `
      {promptData?.isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#202028", padding: "24px", borderRadius: "12px", width: "90%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ marginTop: 0, color: "#f3f0ea", fontSize: "16px" }}>{promptData.title}</h3>
            <input 
              autoFocus
              style={{ width: "100%", padding: "10px", marginTop: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} 
              value={promptInputValue} 
              onChange={e => setPromptInputValue(e.target.value)} 
              onKeyDown={e => {
                if (e.key === "Enter") promptData.onSubmit(promptInputValue);
                if (e.key === "Escape") promptData.onCancel();
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={promptData.onCancel} style={{ padding: "8px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.1)", color: "#f3f0ea", border: "none", cursor: "pointer" }}>Hủy</button>
              <button onClick={() => promptData.onSubmit(promptInputValue)} style={{ padding: "8px 16px", borderRadius: "6px", background: "#d4b26a", color: "#241a0a", border: "none", fontWeight: "bold", cursor: "pointer" }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace(
  "    </main>\n  );\n}",
  modalHtml + "    </main>\n  );\n}"
);

fs.writeFileSync(path, c, 'utf8');
