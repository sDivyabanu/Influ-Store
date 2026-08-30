import React from "react";

export interface ProductCardProps {
  id?: string | number;
  name?: string;
  price?: string | number;
  image?: string;
}

export function ProductCard({ name, price }: ProductCardProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-4">
      {name && <p className="text-sm font-semibold">{name}</p>}
      {price && <p className="text-xs text-neutral-500">{price}</p>}
    </div>
  );
}

export default ProductCard;
