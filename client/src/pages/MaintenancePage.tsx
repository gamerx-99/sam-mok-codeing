import { useEffect } from "react";

export default function MaintenancePage() {
  useEffect(() => {
    document.title = "ปิดปรับปรุงชั่วคราว (Under Maintenance) | SAM MOK CODING";
  }, []);

  return (
    <div className="w-full h-screen min-h-screen overflow-hidden bg-[#f9f9ff]">
      <iframe
        src="/maintenance.html"
        title="Under Maintenance"
        className="w-full h-full border-none m-0 p-0 block"
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    </div>
  );
}
