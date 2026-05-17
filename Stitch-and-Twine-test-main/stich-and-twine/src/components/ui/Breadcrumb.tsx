import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[#9B8B7A]">
      <Link href="/" className="hover:text-[#C4A484] transition-colors flex items-center gap-1">
        <Home size={12} />
        <span>Home</span>
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-[#D8CFC5]" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[#C4A484] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#2E2E2E] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
