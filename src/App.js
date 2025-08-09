import React, { useEffect, useState } from "react";

// SafeView Shield — React Demo (VN, v2)
// Mục tiêu: tập trung vào THẨM MỸ & BỐ CỤC, không GPS, không giới hạn thời gian (chỉ nudges)
// Gồm: Onboarding (cards + social proof + test‑run + paywall), Parent App (dashboard card-based), Kid Mode + Protected Player

// ====== TIỆN ÍCH GIAO DIỆN ======
const Badge = ({ children }) => (
  <span className="px-2 py-1 rounded-full text-xs bg-white/70 backdrop-blur border shadow-sm">{children}</span>
);

const Card = ({ title, right, children, tone = "white" }) => (
  <div
    className={
      tone === "brand"
        ? "rounded-2xl p-4 mb-4 bg-gradient-to-br from-[#7C4DFF] to-[#9C6BFF] text-white shadow-lg"
        : tone === "muted"
          ? "rounded-2xl p-4 mb-4 bg-gray-50 border shadow-sm"
          : "rounded-2xl p-4 mb-4 bg-white border shadow-sm"
    }
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className={`font-semibold ${tone === "brand" ? "text-white" : "text-gray-900"}`}>{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-12 h-7 rounded-full border flex items-center transition-all ${checked ? "bg-[#7C4DFF] justify-end" : "bg-gray-200 justify-start"
      }`}
  >
    <span className="w-6 h-6 rounded-full bg-white shadow m-0.5" />
  </button>
);

const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm mr-2 mb-2">
    {label}
    {onRemove && (
      <button onClick={onRemove} className="text-gray-500 hover:text-gray-700">×</button>
    )}
  </span>
);

const IconBox = ({ emoji, title, desc }) => (
  <div className="rounded-2xl p-4 bg-white border shadow-sm">
    <div className="text-3xl mb-2">{emoji}</div>
    <div className="font-semibold mb-1">{title}</div>
    <div className="text-sm text-gray-600">{desc}</div>
  </div>
);

// ====== ỨNG DỤNG GỐC ======
export default function App() {
  const [firstRun, setFirstRun] = useState(true); // Onboarding chỉ lần đầu
  const [mode, setMode] = useState("parent"); // 'parent' | 'kid'

  // Trạng thái mô phỏng
  const [shieldOn, setShieldOn] = useState(true);
  const [child, setChild] = useState({ name: "Bé Na", age: 8, avatar: "🧒" });
  const [pin, setPin] = useState("");
  const [whitelist, setWhitelist] = useState(["VTV7 Kids", "Monkey Junior", "Kênh Sinh Học Vui"]);
  const [sensitivity, setSensitivity] = useState({ horror: 0.8, gore: 1.0, sexual: 1.0, dangerous: 0.7 });
  const [incidents, setIncidents] = useState([
    { id: "a1", at: "09:32", reason: "Jumpscare", platform: "YouTube", skipped: 12 },
    { id: "a2", at: "18:05", reason: "Âm thanh la hét", platform: "TikTok", skipped: 8 },
  ]);

  const handleFinishOnboarding = () => {
    setFirstRun(false);
    setMode("parent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F5FF] to-white">
      <Header mode={mode} setMode={setMode} />

      <main className="max-w-6xl mx-auto p-4">
        {firstRun ? (
          <Onboarding
            pin={pin}
            setPin={setPin}
            child={child}
            setChild={setChild}
            whitelist={whitelist}
            setWhitelist={setWhitelist}
            sensitivity={sensitivity}
            setSensitivity={setSensitivity}
            onDone={handleFinishOnboarding}
          />
        ) : mode === "parent" ? (
          <ParentApp
            shieldOn={shieldOn}
            setShieldOn={setShieldOn}
            child={child}
            whitelist={whitelist}
            setWhitelist={setWhitelist}
            incidents={incidents}
            sensitivity={sensitivity}
            setSensitivity={setSensitivity}
          />
        ) : (
          <KidApp
            child={child}
            onIncident={(i) => setIncidents((arr) => [{ id: Math.random().toString(36).slice(2), ...i }, ...arr])}
          />
        )}
      </main>
    </div>
  );
}

function Header({ mode, setMode }) {
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <div className="font-semibold">SafeView Shield</div>
            <div className="text-xs text-gray-500">Tường lửa nội dung cho trẻ em</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode("parent")} className={`px-3 py-1 rounded-full text-sm border ${mode === "parent" ? "bg-black text-white" : "bg-white"}`}>Phụ huynh</button>
          <button onClick={() => setMode("kid")} className={`px-3 py-1 rounded-full text-sm border ${mode === "kid" ? "bg-black text-white" : "bg-white"}`}>Trẻ em</button>
        </div>
      </div>
    </header>
  );
}

// ====== ONBOARDING ======
function Onboarding({ pin, setPin, child, setChild, whitelist, setWhitelist, sensitivity, setSensitivity, onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["Giới thiệu", "Hồ sơ & PIN", "Độ nhạy", "Quyền cần thiết", "Kết nối thiết bị", "Test‑run", "Xác thực xã hội", "Dùng thử"];
  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar tiến độ */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 h-max">
        <div className="font-semibold mb-2">Thiết lập ban đầu</div>
        <ol className="text-sm">
          {steps.map((s, i) => (
            <li key={s} className={`py-1 ${i === step ? "font-semibold" : "text-gray-500"}`}>{i + 1}. {s}</li>
          ))}
        </ol>
      </div>

      {/* Nội dung bước */}
      <div>
        {step === 0 && (
          <Card title="Bảo vệ con khỏi video đáng sợ, ngay khi đang phát" tone="brand" right={<Badge>2 phút là xong</Badge>}>
            <div className="grid sm:grid-cols-2 gap-3">
              <IconBox emoji="🧠" title="Lọc nội dung" desc="AI bỏ qua cảnh đáng sợ, bạo lực, 18+ theo thời gian thực." />
              <IconBox emoji="🎚️" title="Độ nhạy & độ tuổi" desc="Tùy chỉnh theo lứa tuổi & giá trị gia đình." />
              <IconBox emoji="▶️" title="Trình phát bảo vệ" desc="Xem YouTube/TikTok qua lớp lá chắn an toàn." />
              <IconBox emoji="🌙" title="Nhắc nghỉ & chế độ đêm" desc="Nhẹ nhàng nhắc con nghỉ, không khóa cứng." />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-2 rounded-xl bg-white text-black" onClick={next}>Bắt đầu →</button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card title="Hồ sơ trẻ & mã PIN">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Tên trẻ</div>
                <input className="border rounded-xl px-3 py-2 w-full" value={child.name} onChange={(e) => setChild({ ...child, name: e.target.value })} />
              </label>
              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Tuổi</div>
                <input type="number" className="border rounded-xl px-3 py-2 w-full" value={child.age} min={4} max={16} onChange={(e) => setChild({ ...child, age: parseInt(e.target.value || "0", 10) })} />
              </label>
              <label className="block">
                <div className="text-sm text-gray-600 mb-1">PIN phụ huynh</div>
                <input className="border rounded-xl px-3 py-2 w-full" placeholder="4–6 số" value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} />
              </label>
            </div>
            <div className="mt-3"><button className="px-3 py-2 rounded-xl border" onClick={next} disabled={pin.length < 4}>Tiếp tục</button></div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Chọn độ nhạy nội dung phù hợp">
            <Slider label="Kinh dị/Jumpscare" value={sensitivity.horror} onChange={(v) => setSensitivity({ ...sensitivity, horror: v })} />
            <Slider label="Máu me" value={sensitivity.gore} onChange={(v) => setSensitivity({ ...sensitivity, gore: v })} />
            <Slider label="Chủ đề nhạy cảm" value={sensitivity.sexual} onChange={(v) => setSensitivity({ ...sensitivity, sexual: v })} />
            <Slider label="Hành vi nguy hiểm" value={sensitivity.dangerous} onChange={(v) => setSensitivity({ ...sensitivity, dangerous: v })} />
            <div className="mt-3"><button className="px-3 py-2 rounded-xl border" onClick={next}>Tiếp theo</button></div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Cấp quyền cần thiết">
            <div className="grid sm:grid-cols-3 gap-3">
              <PermitItem icon="🪟" title="Lớp phủ/Accessibility" desc="Để SafeView quan sát khung hình và bỏ qua cảnh xấu." />
              <PermitItem icon="🔔" title="Thông báo" desc="Gửi nhắc nghỉ & cảnh báo sự cố." />
              <PermitItem icon="🔋" title="Bỏ tối ưu pin (Android)" desc="Đảm bảo lá chắn hoạt động ổn định." />
            </div>
            <div className="mt-3"><button className="px-3 py-2 rounded-xl border" onClick={next}>Đã hiểu</button></div>
          </Card>
        )}

        {step === 4 && (
          <Card title="Kết nối thiết bị của trẻ">
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div>
                <p className="text-gray-600 mb-2">Quét mã QR trên thiết bị của trẻ để đăng nhập nhanh Kid Mode.</p>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-xl border">Tạo mã QR</button>
                  <button className="px-3 py-2 rounded-xl border">Hướng dẫn cài đặt</button>
                </div>
              </div>
              <div className="aspect-square bg-gray-100 rounded-2xl grid place-items-center text-4xl">▣</div>
            </div>
            <div className="mt-3"><button className="px-3 py-2 rounded-xl border" onClick={next}>Tiếp theo</button></div>
          </Card>
        )}

        {step === 5 && (
          <Card title="Thử nghiệm nhanh (1 cảnh)" tone="muted">
            <p className="text-gray-700 mb-2">Bấm chạy video mẫu; khi gặp cảnh đáng sợ, SafeView sẽ tự động bỏ qua 12 giây và hiển thị lý do.</p>
            <DemoShield onContinue={() => setStep(6)} />
          </Card>
        )}

        {step === 6 && (
          <Card title="Hơn 2 triệu phụ huynh tin dùng (ví dụ)" tone="white">
            <div className="grid sm:grid-cols-2 gap-3">
              <IconBox emoji="✅" title="Bỏ qua cảnh đáng sợ" desc="Trẻ không phải nhìn thấy cảnh xấu." />
              <IconBox emoji="🔒" title="Không lưu video thô" desc="Chỉ ghi lý do & thời lượng đã bỏ qua." />
            </div>
            <div className="mt-3"><button className="px-3 py-2 rounded-xl border" onClick={next}>Tiếp tục</button></div>
          </Card>
        )}

        {step === 7 && (
          <Card title="Dùng thử miễn phí 3 ngày" tone="white">
            <div className="rounded-2xl border p-4 mb-3 bg-white">
              <div className="text-lg font-semibold mb-1">“Con mình ngủ đúng giờ hơn và không còn sợ video bất ngờ.”</div>
              <div className="text-sm text-gray-600">— Một phụ huynh tại Hà Nội</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Plan title="3 ngày đầu miễn phí" price="83.000đ/tháng" note="(999.000đ/năm)" best />
              <Plan title="129.000đ/tháng" price="129.000đ/tháng" />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-3 rounded-xl bg-[#7C4DFF] text-white shadow" onClick={onDone}>Bắt đầu dùng thử</button>
              <button className="px-4 py-3 rounded-xl border">Để sau</button>
            </div>
            <div className="text-xs text-gray-500 mt-2">Được App Store/Play bảo vệ • Hủy bất cứ lúc nào</div>
          </Card>
        )}

        <div className="flex justify-between">
          <button onClick={back} className="px-3 py-2 rounded-xl border disabled:opacity-40" disabled={step === 0}>← Quay lại</button>
          <div className="text-sm text-gray-500">Bước {step + 1} / {steps.length}</div>
        </div>
      </div>
    </div>
  );
}

function PermitItem({ icon, title, desc }) {
  return (
    <div className="rounded-2xl p-4 bg-white border shadow-sm">
      <div className="text-3xl">{icon}</div>
      <div className="font-semibold mt-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  );
}

function Slider({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-sm text-gray-500">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full" />
    </div>
  );
}

function DemoShield({ onContinue }) {
  const [stage, setStage] = useState("idle");
  useEffect(() => {
    if (stage === "play") {
      const id = setTimeout(() => setStage("blocked"), 2200);
      return () => clearTimeout(id);
    }
  }, [stage]);
  return (
    <div>
      {stage === "idle" && <button className="px-3 py-2 rounded-xl border" onClick={() => setStage("play")}>Chạy video mẫu ▶</button>}
      {stage === "play" && <div className="h-32 rounded-xl bg-black/80 text-white grid place-items-center">Đang phát…</div>}
      {stage === "blocked" && (
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <div className="font-medium">🔒 Đã bỏ qua 12 giây vì cảnh đáng sợ</div>
          <div className="text-sm text-gray-700">Lý do: Âm thanh la hét + Cảnh tối + Biến dạng khuôn mặt</div>
          <div className="mt-2"><button className="px-3 py-2 rounded-xl border" onClick={onContinue}>Tiếp tục</button></div>
        </div>
      )}
    </div>
  );
}

function Plan({ title, price, note, best }) {
  return (
    <div className={`rounded-2xl p-4 border ${best ? "border-[#7C4DFF] bg-[#F6F1FF]" : "bg-white"}`}>
      {best && <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Lựa chọn tốt nhất</span>}
      <div className="font-semibold mt-1">{title}</div>
      <div className="text-sm text-gray-600">{price} {note && <span className="text-gray-400">{note}</span>}</div>
    </div>
  );
}

// ====== PARENT APP ======
function ParentApp({ shieldOn, setShieldOn, child, whitelist, setWhitelist, incidents, sensitivity, setSensitivity }) {
  const [tab, setTab] = useState("dashboard"); // dashboard | incidents | rules | devices | more
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      {/* Side nav */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 h-max">
        <div className="font-semibold mb-2">Phụ huynh</div>
        {[
          ["dashboard", "Bảng điều khiển"],
          ["incidents", "Sự cố"],
          ["rules", "Quy tắc"],
          ["devices", "Thiết bị"],
          ["more", "Khác"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`w-full text-left px-3 py-2 rounded-xl border mb-2 ${tab === k ? "bg-black text-white" : "bg-white"}`}>{label}</button>
        ))}
      </div>

      {/* Content */}
      <div>
        {tab === "dashboard" && (
          <div>
            <Card title="Lá chắn nội dung" tone="brand" right={<Badge>Kid: {child.name} • {child.age}t</Badge>}>
              <div className="flex items-center gap-4">
                <Toggle checked={shieldOn} onChange={setShieldOn} />
                <div>
                  <div className="font-medium">Trạng thái: {shieldOn ? "BẬT" : "TẮT"}</div>
                  <div className="text-sm text-white/80">Tự động bỏ qua cảnh đáng sợ, bạo lực, 18+.</div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card title="Sự cố hôm nay" right={<button className="text-sm underline">Xem tất cả →</button>}>
                <IncidentList items={incidents.slice(0, 4)} compact />
              </Card>
              <Card title="Kênh tin cậy (Whitelist)">
                <div className="flex flex-wrap">
                  {whitelist.map((w, i) => (
                    <Chip key={i} label={w} onRemove={() => setWhitelist(whitelist.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
                <AddWhitelist onAdd={(name) => setWhitelist([...whitelist, name])} />
              </Card>
            </div>

            <Card title="Nhắc nghỉ & Chế độ Đêm" tone="muted">
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Nhắc nghỉ mỗi 20–30 phút</label>
                <label className="flex items-center gap-2"><input type="checkbox" /> Làm dịu màn hình sau 21:00</label>
                <label className="flex items-center gap-2"><input type="checkbox" /> Gợi ý nội dung nhẹ vào buổi tối</label>
              </div>
            </Card>
          </div>
        )}

        {tab === "incidents" && (
          <Card title="Nhật ký sự cố (lọc nội dung)">
            <IncidentList items={incidents} />
          </Card>
        )}

        {tab === "rules" && (
          <div>
            <Card title="Độ nhạy nội dung">
              <Slider label="Kinh dị/Jumpscare" value={sensitivity.horror} onChange={(v) => setSensitivity({ ...sensitivity, horror: v })} />
              <Slider label="Máu me" value={sensitivity.gore} onChange={(v) => setSensitivity({ ...sensitivity, gore: v })} />
              <Slider label="Chủ đề nhạy cảm" value={sensitivity.sexual} onChange={(v) => setSensitivity({ ...sensitivity, sexual: v })} />
              <Slider label="Hành vi nguy hiểm" value={sensitivity.dangerous} onChange={(v) => setSensitivity({ ...sensitivity, dangerous: v })} />
            </Card>
            <Card title="Kênh tin cậy (Whitelist)">
              <div className="flex flex-wrap mb-2">
                {whitelist.map((w, i) => (
                  <Chip key={i} label={w} onRemove={() => setWhitelist(whitelist.filter((_, idx) => idx !== i))} />
                ))}
              </div>
              <AddWhitelist onAdd={(name) => setWhitelist([...whitelist, name])} />
            </Card>
          </div>
        )}

        {tab === "devices" && (
          <div className="grid md:grid-cols-2 gap-4">
            <DeviceCard name="Android của Na" status="Trực tuyến" shield={shieldOn ? "BẬT" : "TẮT"} />
            <DeviceCard name="iPad Mini" status="Ngoại tuyến" shield="—" />
          </div>
        )}

        {tab === "more" && (
          <Card title="Khác">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" /> Tham gia chương trình dùng thử tính năng mới</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Ẩn hoàn toàn tính năng vị trí (GPS)</label>
            </div>
            <div className="mt-3 text-xs text-gray-500">SafeView không lưu video thô; chỉ ghi lý do chặn và thời lượng đã bỏ qua.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

function IncidentList({ items, compact }) {
  if (!items.length) return <div className="text-gray-500">Chưa có sự cố.</div>;
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.id} className={`flex items-center justify-between rounded-xl border p-2 ${compact ? "text-sm" : ""}`}>
          <div>
            <span className="text-gray-500 mr-2">[{i.at}]</span>
            <span className="font-medium">{i.reason}</span>
            <span className="text-gray-500"> • {i.platform} • skip {i.skipped}s</span>
          </div>
          <button className="px-2 py-1 rounded-lg border text-xs">Giải thích</button>
        </div>
      ))}
    </div>
  );
}

function AddWhitelist({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input className="border rounded-xl px-3 py-2 flex-1" placeholder="Thêm kênh/creator" value={val} onChange={(e) => setVal(e.target.value)} />
      <button className="px-3 py-2 rounded-xl border" onClick={() => { if (!val.trim()) return; onAdd(val.trim()); setVal(""); }}>Thêm</button>
    </div>
  );
}

function DeviceCard({ name, status, shield }) {
  return (
    <Card title={name}>
      <div className="text-sm text-gray-700">Trạng thái: {status} • Lá chắn: {shield}</div>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-2 rounded-xl border">Tạm dừng</button>
        <button className="px-3 py-2 rounded-xl border">Hủy ghép</button>
      </div>
    </Card>
  );
}

// ====== KID APP ======
function KidApp({ child, onIncident }) {
  const [tab, setTab] = useState("home"); // home | explore | player | rewards
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar Kid */}
      <div className="rounded-2xl p-4 h-max bg-gradient-to-br from-[#7C4DFF] to-[#9C6BFF] text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{child.avatar}</div>
          <div>
            <div className="font-semibold">{child.name}</div>
            <div className="text-white/80 text-sm">{child.age} tuổi</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["home", "🏠 Trang chủ"],
            ["explore", "🔎 Khám phá"],
            ["player", "▶ Trình phát"],
            ["rewards", "🏆 Phần thưởng"],
          ].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-3 py-2 rounded-xl border border-white/30 ${tab === k ? "bg-white text-black" : "bg-white/10 text-white"}`}>{label}</button>
          ))}
        </div>
        <div className="mt-3 text-sm text-white/90">Lá chắn: <b>● BẬT</b> • ⏳ Nhắc nghỉ định kỳ</div>
      </div>

      <div>
        {tab === "home" && <KidHome onOpenPlayer={() => setTab("player")} />}
        {tab === "explore" && <KidExplore onOpenPlayer={() => setTab("player")} />}
        {tab === "player" && <ProtectedPlayer onIncident={onIncident} />}
        {tab === "rewards" && <KidRewards />}
      </div>
    </div>
  );
}

function KidHome({ onOpenPlayer }) {
  return (
    <div>
      <Card title="Tìm kiếm an toàn" right={<Badge>Giọng nói 🎤</Badge>}>
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="Con muốn xem gì?" />
      </Card>
      <Card title="Chủ đề gợi ý">
        <div className="flex flex-wrap gap-2">
          {["Toán", "Động vật", "Minecraft", "DIY", "Không gian"].map((x) => (
            <span key={x} className="px-3 py-1 rounded-full bg-gray-100 text-sm">{x}</span>
          ))}
        </div>
      </Card>
      <Card title="Hàng chờ an toàn" right={<button className="text-sm underline">Xem tất cả →</button>}>
        <div className="grid sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border">
              <div className="aspect-video bg-gray-200 grid place-items-center">Ảnh thu nhỏ</div>
              <div className="p-2 text-sm">Video {i} • An toàn</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end"><button onClick={onOpenPlayer} className="px-3 py-2 rounded-xl border">Xem bằng Trình phát bảo vệ ▶</button></div>
      </Card>
      <Card title="Nhắc nhở nhẹ" tone="muted">
        <div className="text-sm text-gray-700">🌙 Buổi tối hãy chọn nội dung nhẹ – SafeView sẽ nhắc con nghỉ đều đặn.</div>
      </Card>
    </div>
  );
}

function KidExplore({ onOpenPlayer }) {
  return (
    <Card title="Khám phá an toàn">
      <div className="grid md:grid-cols-4 gap-3">
        {["Khoa học", "Thể thao", "Vẽ", "Lịch sử"].map((x) => (
          <div key={x} className="rounded-2xl border p-4">
            <div className="font-medium mb-1">{x}</div>
            <div className="text-xs text-gray-500 mb-2">Danh sách phát đã kiểm duyệt</div>
            <button className="px-3 py-2 rounded-xl border" onClick={onOpenPlayer}>Xem ▶</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function KidRewards() {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {["Lá chắn đầu tiên!", "Bình tĩnh chọn lại", "Chuỗi 3 ngày"].map((b, i) => (
        <div key={i} className="rounded-2xl border p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-3xl">🏅</div>
          <div className="font-medium mt-2">{b}</div>
          <div className="text-xs text-gray-500">Danh hiệu đạt được</div>
        </div>
      ))}
    </div>
  );
}

// ====== PROTECTED PLAYER ======
function ProtectedPlayer({ onIncident }) {
  const [progress, setProgress] = useState(0);
  const [overlay, setOverlay] = useState(null); // {reason, skipped}
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || overlay) return;
    const id = setInterval(() => setProgress((p) => Math.min(120, p + 1)), 100);
    return () => clearInterval(id);
  }, [playing, overlay]);

  useEffect(() => {
    if (progress === 30 && !overlay) {
      setOverlay({ reason: "Âm thanh la hét + Cảnh tối + Biến dạng khuôn mặt", skipped: 12 });
      onIncident?.({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), reason: "Jumpscare", platform: "YouTube", skipped: 12 });
    }
  }, [progress]);

  const skip = (sec) => setProgress((p) => Math.min(120, p + sec));

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border bg-black text-white relative">
        <div className="aspect-video grid place-items-center text-2xl">{playing ? "Đang phát…" : "Đã tạm dừng"}</div>
        {overlay && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm text-white p-4 flex items-center justify-center">
            <div className="bg-white text-black rounded-xl p-4 max-w-md w-full shadow">
              <div className="font-semibold mb-1">🔒 Đã bỏ qua {overlay.skipped}s vì cảnh không phù hợp</div>
              <div className="text-sm text-gray-700">Lý do: {overlay.reason}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="px-3 py-2 rounded-xl border" onClick={() => { setOverlay(null); setPlaying(true); skip(overlay.skipped); }}>Tiếp tục xem</button>
                <button className="px-3 py-2 rounded-xl border" onClick={() => { setOverlay(null); skip(overlay.skipped + 10); }}>Bỏ qua tiếp</button>
                <button className="px-3 py-2 rounded-xl border">Giải thích</button>
              </div>
              <div className="text-xs text-right text-gray-500 mt-2">(PIN phụ huynh ▢▢▢▢)</div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 bg-gray-200 rounded w-full overflow-hidden">
          <div className="h-full bg-gray-800" style={{ width: `${(progress / 120) * 100}%` }} />
        </div>
        <div className="text-sm w-20 text-right">{progress}s</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded-xl border" onClick={() => setPlaying((p) => !p)}>{playing ? "Tạm dừng" : "Phát"}</button>
        <button className="px-3 py-2 rounded-xl border" onClick={() => skip(10)}>Bỏ qua 10s</button>
        <button className="px-3 py-2 rounded-xl border" onClick={() => setOverlay({ reason: "Kiểm thử thủ công: khung hình máu me", skipped: 12 })}>Kích hoạt lá chắn</button>
      </div>
    </div>
  );
}
