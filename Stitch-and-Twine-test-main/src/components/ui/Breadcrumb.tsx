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
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
      <Link href="/" className="hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1">
        <Home size={12} />
        <span>Home</span>
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-[#D8CFC5]" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--accent-gold)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text-primary)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
