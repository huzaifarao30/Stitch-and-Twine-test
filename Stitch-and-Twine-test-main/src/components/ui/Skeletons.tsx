export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-2xl overflow-hidden shadow-boutique">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-2.5 w-20 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-[92%] rounded-md" />
          <div className="skeleton h-4 w-[68%] rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-2.5 w-16 rounded-full" />
          <div className="skeleton h-2.5 w-8 rounded-full" />
        </div>
        <div className="flex justify-between items-end mt-1">
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-24 rounded-md" />
            <div className="skeleton h-3 w-16 rounded-md" />
          </div>
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="skeleton aspect-[3/4] rounded-2xl" />
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-3">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-20 h-20 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton h-10 w-3/4 rounded-lg" />
        <div className="skeleton h-8 w-32 rounded-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-4 w-full rounded-full" />
          ))}
        </div>
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
