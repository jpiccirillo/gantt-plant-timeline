import { useLayoutEffect, useState } from "react";
import { debounce } from "../utils/";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 810);

  useLayoutEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 810);
    };
    window.addEventListener("resize", debounce(updateSize, 250));
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return isMobile;
};

export default useIsMobile;
