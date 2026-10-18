// decorative; same seed always gives the same bars
export default function Barcode({ seed }) {
  let n = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 100003, 7);
  let x = 0;
  const bars = [];
  for (let i = 0; i < 46; i++) {
    n = (n * 1103 + 12345) % 100003;
    const w = 1 + (n % 4);
    bars.push(<rect key={i} x={x} width={w} height="40" />);
    x += w + 1 + ((n >> 3) % 3);
  }
  return (
    <svg className="barcode" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" aria-hidden="true">
      {bars}
    </svg>
  );
}
