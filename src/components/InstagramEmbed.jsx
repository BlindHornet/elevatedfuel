// Module Imports
import React, { useEffect, useMemo, useRef, useState } from "react";

function isInstagramPostUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("instagram.com") &&
      (/\/p\//.test(u.pathname) ||
        /\/reel\//.test(u.pathname) ||
        /\/tv\//.test(u.pathname))
    );
  } catch {
    return false;
  }
}

export default function InstagramEmbed({ url }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [html, setHtml] = useState("");
  const containerRef = useRef(null);

  const ig = useMemo(() => isInstagramPostUrl(url), [url]);

  useEffect(() => {
    if (!ig) {
      setStatus("idle");
      setHtml("");
      return;
    }

    let cancelled = false;

    async function load() {
      setStatus("loading");
      setHtml("");

      try {
        const endpoint = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`oEmbed failed (${res.status})`);
        const data = await res.json();

        if (cancelled) return;
        setHtml(data?.html || "");
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        console.error("Instagram oEmbed error:", e);
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ig, url]);

  // Inject Instagram embed script once (needed to render the blockquote)
  useEffect(() => {
    if (status !== "ready") return;
    const already = document.querySelector(
      'script[src="https://www.instagram.com/embed.js"]',
    );
    if (already) {
      // If script exists, ask it to re-process embeds
      if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
      return;
    }

    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = () => window.instgrm?.Embeds?.process?.();
    document.body.appendChild(s);
  }, [status]);

  if (!ig) return null;

  return (
    <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-3">
      <div className="text-xs text-slate-500 mb-2">Instagram preview</div>

      {status === "loading" ? (
        <div className="h-[220px] rounded-2xl bg-slate-100 animate-pulse" />
      ) : status === "error" ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
          Instagram preview couldn’t load (oEmbed often requires an access
          token).
          <div className="mt-2 text-xs text-slate-500">
            Quick fix: paste a direct image URL instead, or upload the image
            file.
          </div>
        </div>
      ) : status === "ready" ? (
        <div
          ref={containerRef}
          className="overflow-hidden rounded-2xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </div>
  );
}
