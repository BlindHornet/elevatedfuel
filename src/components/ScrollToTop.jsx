// The component listens for changes in the URL path and scrolls the window to the top whenever the path changes.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Test if I like "smooth" or instant"
    });
  }, [pathname]);

  return null;
}
