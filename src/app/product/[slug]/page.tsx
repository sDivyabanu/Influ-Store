import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { getProductBySlug } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found | Influ-Store" };
  }
  return {
    title: `${product.name} | Influ-Store`,
    description: product.description || `Shop ${product.name} from ${product.seller.storeName} on Influ-Store.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-24">
        <ProductDetailClient product={product} />
      </div>

      <Footer />
    </main>
  );
}
