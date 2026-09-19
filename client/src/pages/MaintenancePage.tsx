import { useEffect } from "react";

export default function MaintenancePage() {
  useEffect(() => {
    document.title = "ปิดปรับปรุงชั่วคราว (Under Maintenance) | SAM MOK CODING";
    window.location.replace("/maintenance.html");
  }, []);

  return null;
}
