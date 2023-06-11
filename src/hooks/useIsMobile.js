import { useLayoutEffect, useState } from "react";
import debounce from "lodash/debounce";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 800);
    };
    window.addEventListener("resize", debounce(updateSize, 250));
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return isMobile;
};

export default useIsMobile;
