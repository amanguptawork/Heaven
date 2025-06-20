import { useState, useEffect } from "react";

export const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    // Cleanup when unmounting
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
};
