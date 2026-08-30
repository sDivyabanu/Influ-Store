import { Prisma } from "@prisma/client";

/**
 * The only shape money ever crosses the API boundary in — never a raw
 * Prisma Decimal, never a JS float. `amount` is a fixed 2-decimal string
 * so clients never have to worry about floating-point rounding.
 */
export interface Money {
  amount: string;
  currency: string;
}

export function toMoney(value: Prisma.Decimal | number | string, currency: string): Money {
  const decimal = value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
  return { amount: decimal.toFixed(2), currency };
}

export function formatMoney(money: Money): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: money.currency,
    }).format(Number(money.amount));
  } catch {
    return `${money.currency} ${money.amount}`;
  }
}
