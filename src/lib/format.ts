/**
 * Indian numbering: 1,23,456 (lakhs/crores), NOT Western 123,456.
 */
export function formatINR(amount: number, options?: { withSymbol?: boolean }): string {
  const withSymbol = options?.withSymbol ?? true;
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = rest ? `${formattedRest},${lastThree}` : lastThree;
  const decimal = decPart && decPart !== "00" ? `.${decPart}` : "";
  return `${isNeg ? "-" : ""}${withSymbol ? "₹" : ""}${formatted}${decimal}`;
}

/**
 * +91 XXXXX XXXXX. Accepts raw 10-digit string or with country code.
 */
export function formatIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const ten = digits.length > 10 ? digits.slice(-10) : digits.padEnd(10, "");
  const a = ten.slice(0, 5);
  const b = ten.slice(5, 10);
  return `+91 ${a}${b ? " " + b : ""}`.trim();
}
