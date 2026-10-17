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
  min = 0,
  max,
  className = "",
  ...rest
}) {
  const [draft, setDraft] = useState(toText(value, decimals));
  const focused = useRef(false);

  // Jab tak user type kar raha hai draft ko mat chhedo;
  // bahar se value badle (reset / amount back-calc) to sync karo.
  useEffect(() => {
    if (!focused.current) setDraft(toText(value, decimals));
  }, [value, decimals]);

  const handleChange = (e) => {
    const text = e.target.value;

    // sirf digits aur ek decimal point allow
    if (!/^\d*\.?\d*$/.test(text)) return;

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
      type="text"
      inputMode="decimal"
      value={draft}
      placeholder={rest.placeholder ?? "0"}
      onFocus={(e) => {
        focused.current = true;
        e.target.select();
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        focused.current = false;
        setDraft(toText(value, decimals));
        rest.onBlur?.(e);
      }}
      onChange={handleChange}
      className={className}
    />
  );
}
