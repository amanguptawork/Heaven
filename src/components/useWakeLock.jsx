import { useEffect, useRef } from "react";
import NoSleep from "nosleep.js";

export default function useWakeLock() {
  const wakeLockRef = useRef(null);
  const noSleepRef = useRef(null);

  useEffect(() => {
    noSleepRef.current = new NoSleep();

    let isActive = true;
    let wakeLock = null;

    // Request Wake Lock via the standard API
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          console.log("🛌 Wake Lock was released");
        });
        console.log("🔒 Wake Lock is active");
      } catch (err) {
        console.error("❌ Wake Lock request failed:", err);
      }
    };

    // For browsers that support it
    if ("wakeLock" in navigator) {
      requestWakeLock();
      // Re-request on visibility change (some browsers release on blur)
      document.addEventListener("visibilitychange", () => {
        if (isActive && document.visibilityState === "visible") {
          requestWakeLock();
        }
      });
    } else {
      // Fallback for Safari iOS (and any non-supporting browser)
      // NoSleep.js requires a user gesture to start the video loop
      const enableNoSleep = () => {
        noSleepRef.current.enable();
        console.log("🔒 NoSleep enabled");
        document.removeEventListener("touchstart", enableNoSleep);
        document.removeEventListener("click", enableNoSleep);
      };
      document.addEventListener("touchstart", enableNoSleep, { once: true });
      document.addEventListener("click", enableNoSleep, { once: true });
    }

    return () => {
      isActive = false;
      // clean up Wake Lock
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
      // disable NoSleep if it was ever enabled
      if (noSleepRef.current) {
        noSleepRef.current.disable();
      }
    };
  }, []);
}
