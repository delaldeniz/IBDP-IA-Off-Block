import { useEffect, useRef, useState } from "react";

// open/close state for a popup, closes on outside click, opens upwards if there's no room below
export function usePopover(height) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const rootRef = useRef(null);

  const show = () => {
    const box = rootRef.current.getBoundingClientRect();
    const below = innerHeight - box.bottom;
    setUp(below < height && box.top > below);
    setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return { open, up, rootRef, show, hide };
}

// scroll a list just enough so item `i` is visible
export function keepInView(list, i) {
  const item = list?.children[i];
  if (!item) return;
  if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
  else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight)
    list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
}
