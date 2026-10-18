import { useEffect, useMemo, useRef } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topo from "../assets/land-110m.json";
import { gsap, reducedMotion } from "../effects/motion.js";
import { IST } from "../data/destinations.js";

const W = 460;
const H = 120;
const GAP = 5;
const land = feature(topo, topo.objects.land);

// zoom so both airports fit, draw land on a hidden canvas, keep a dot wherever there's land
function buildMap(dest) {
  const from = [IST.lon, IST.lat];
  const to = [dest.lon, dest.lat];

  const probe = geoNaturalEarth1().scale(100).translate([0, 0]);
  const [ax, ay] = probe(from);
  const [bx, by] = probe(to);
  const scale = Math.min(4200, Math.max(W / 6, 100 * Math.min((W * 0.6) / Math.max(Math.abs(ax - bx), 14), (H * 0.5) / Math.max(Math.abs(ay - by), 7))));
  const proj = geoNaturalEarth1().scale(scale).center([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]).translate([W / 2, H / 2]);

  const ctx = Object.assign(document.createElement("canvas"), { width: W, height: H }).getContext("2d", { willReadFrequently: true });
  ctx.beginPath();
  geoPath(proj, ctx)(land);
  ctx.fill();
  const px = ctx.getImageData(0, 0, W, H).data;

  let dots = "";
  for (let y = GAP / 2; y < H; y += GAP)
    for (let x = GAP / 2; x < W; x += GAP)
      if (px[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) dots += `M${x} ${y}h0.01`;

  return { dots, arc: geoPath(proj)({ type: "LineString", coordinates: [from, to] }), start: proj(from), end: proj(to) };
}

export default function RouteMap({ destination: dest }) {
  const map = useMemo(() => (dest?.lat != null ? buildMap(dest) : null), [dest?.code]);
  const arcRef = useRef(null);
  const planeRef = useRef(null);

  // draw the arc while the plane flies along it, then keep looping the plane
  useEffect(() => {
    if (!map) return;
    const arc = arcRef.current;
    const plane = planeRef.current;
    const len = arc.getTotalLength();
    arc.style.strokeDasharray = len;

    const place = (t) => {
      const p = arc.getPointAtLength(len * t);
      const a = arc.getPointAtLength(Math.min(len, len * t + 1));
      const b = arc.getPointAtLength(Math.max(0, len * t - 1));
      const angle = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI + 90;
      plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
    };

    if (reducedMotion()) {
      arc.style.strokeDashoffset = 0;
      return place(0.5);
    }

    const s = { t: 0 };
    const tl = gsap
      .timeline()
      .fromTo(s, { t: 0 }, { t: 1, duration: 1.6, ease: "power2.inOut", onUpdate: () => {
        arc.style.strokeDashoffset = len * (1 - s.t);
        place(s.t);
      } })
      .fromTo(s, { t: 0 }, { t: 1, duration: 5, ease: "none", repeat: -1, repeatDelay: 0.6, onUpdate: () => place(s.t) });
    return () => tl.kill();
  }, [map]);

  if (!map)
    return (
      <div className="route-map route-map-empty">
        <p className="pass-label">No route preview for this destination</p>
      </div>
    );

  const label = ([x, y]) => y + (y > H - 24 ? -10 : 16);
  return (
    <div className="route-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Route from Istanbul to ${dest.city}`}>
        <path d={map.dots} className="map-dots" />
        <path ref={arcRef} d={map.arc} className="map-arc" />
        <path ref={planeRef} className="map-plane" d="M0 -8 L2 -2 L8 2 L8 4 L2 2 L1.5 6 L4 8 L4 9 L0 8 L-4 9 L-4 8 L-1.5 6 L-2 2 L-8 4 L-8 2 L-2 -2 Z" />
        <circle cx={map.start[0]} cy={map.start[1]} r="3.5" className="map-point" />
        <circle cx={map.end[0]} cy={map.end[1]} r="3.5" className="map-point" />
        <text x={map.start[0]} y={label(map.start)} textAnchor="middle" className="map-text">IST</text>
        <text x={map.end[0]} y={label(map.end)} textAnchor="middle" className="map-text">{dest.code}</text>
      </svg>
    </div>
  );
}
