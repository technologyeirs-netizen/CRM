import { useEffect, useRef, useState } from "react";

// Number input jo user ko freely type karne deta hai:
//  - poora clear kar sakte ho (backspace) aur naya value type kar sakte ho
//  - "12." ya "0.5" jaisi in-progress typing break nahi hoti
//  - focus par poora text select ho jata hai (seedha overwrite)
//  - blur par value clean format ho jati hai
// Parent ko har change par number milta hai (empty => 0).
const toText = (v, decimals) => {
  const n = Number(v);
  if (v === "" || v === null || v === undefined || Number.isNaN(n)) return "";
  // trailing zeros hata do (12.50 -> 12.5), max `decimals` tak
  return String(Number(n.toFixed(decimals)));
};

export default function EditableNumberInput({
  value,
  onValueChange,
  decimals = 2,
  integer = false, // true => sirf whole number, spinner (▲▼) 1-1 se badhega
  min = 0,
  max,
  className = "",
  ...rest
}) {
  const dec = integer ? 0 : decimals;
  const [draft, setDraft] = useState(toText(value, dec));
  const focused = useRef(false);
  const justFocused = useRef(false);

  // Jab tak user type kar raha hai draft ko mat chhedo;
  // bahar se value badle (reset / amount back-calc) to sync karo.
  useEffect(() => {
    if (!focused.current) setDraft(toText(value, dec));
  }, [value, dec]);

  const handleChange = (e) => {
    let text = e.target.value;

    if (integer) {
      // decimal part hata do: 12.7 -> 12
      text = text.split(".")[0].replace(/[^\d]/g, "");
    } else if (!/^\d*\.?\d*$/.test(text)) {
      // sirf digits aur ek decimal point allow
      return;
    }

    setDraft(text);

    let num = text === "" || text === "." ? 0 : Number(text);
    if (Number.isNaN(num)) num = 0;
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) {
      num = max;
      setDraft(String(max));
    }

    onValueChange(num);
  };

  return (
    <input
      {...rest}
      type={integer ? "number" : "text"}
      inputMode={integer ? "numeric" : "decimal"}
      {...(integer ? { step: 1, min } : {})}
      value={draft}
      placeholder={rest.placeholder ?? "0"}
      onFocus={(e) => {
        focused.current = true;
        justFocused.current = true;
        e.target.select(); // ek hi baar mein poora select
        rest.onFocus?.(e);
      }}
      onMouseUp={(e) => {
        // click ke baad browser selection hata deta hai; pehli click par rok do
        if (justFocused.current) {
          e.preventDefault();
          justFocused.current = false;
        }
        rest.onMouseUp?.(e);
      }}
      onBlur={(e) => {
        focused.current = false;
        justFocused.current = false;
        setDraft(toText(value, dec));
        rest.onBlur?.(e);
      }}
      onChange={handleChange}
      className={className}
    />
  );
}
