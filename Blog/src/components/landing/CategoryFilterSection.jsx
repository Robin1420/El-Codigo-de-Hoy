import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@heroui/react";

export default function CategoryFilterSection({ posts = [], formatDate }) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          posts
            .map((post) => post.categories?.name)
            .filter((name) => typeof name === "string" && name.trim().length > 0),
        ),
      ),
    [posts],
  );

  const [activeCategories, setActiveCategories] = useState(["Todos"]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredPosts = useMemo(() => {
    if (activeCategories.includes("Todos")) {
      return posts;
    }
    return posts.filter((post) =>
      activeCategories.includes(post.categories?.name),
    );
  }, [posts, activeCategories]);

  const chips = ["Todos", ...categories];
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const visiblePosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, page]);

  useEffect(() => {
    setPage(1);
  }, [activeCategories]);

  return (
    <section className=" rounded-2xl  backdrop-blur-md flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const isActive = activeCategories.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => {
                if (chip === "Todos") {
                  setActiveCategories(["Todos"]);
                  return;
                }
                const next = new Set(
                  activeCategories.filter((c) => c !== "Todos"),
                );
                if (next.has(chip)) {
                  next.delete(chip);
                } else {
                  next.add(chip);
                }
                if (next.size === 0) {
                  setActiveCategories(["Todos"]);
                } else {
                  setActiveCategories(Array.from(next));
                }
              }}
              className={[
                "px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide border transition-colors",
                isActive
                  ? "bg-[var(--color-500)] border-[var(--color-500)] text-white"
                  : "bg-[rgba(255,255,255,0.06)] border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--color-500)]",
              ].join(" ")}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="text-sm text-[var(--subtle-text)]">
            No hay publicaciones para esta categoría.
          </div>
        ) : (
          visiblePosts.map((post) => (
            <article
              key={post.id}
              className="flex gap-4 rounded-xl border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm p-4"
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] flex-shrink-0">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--subtle-text)] text-xs">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase text-[var(--subtle-text)]">
                  {post.categories?.name && (
                    <span className="px-2 py-[2px] rounded-full bg-[rgba(255,255,255,0.08)] backdrop-blur-md border border-[var(--border-color)]">
                      {post.categories.name}
                    </span>
                  )}
                  {post.published_at && (
                    <span className="text-[var(--subtle-text)] lowercase">
                      {formatDate(post.published_at)}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold leading-tight">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-[var(--subtle-text)] line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {filteredPosts.length > pageSize && (
        <div className="flex justify-center">
          <Pagination
            color="primary"
            page={page}
            total={totalPages}
            onChange={setPage}
            className="text-white"
            classNames={{
              item:
                "border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)]",
              cursor:
                "bg-[var(--color-500)] text-white border border-[var(--color-500)]",
            }}
            style={{ "--heroui-primary": "244 50 11" }}
          />
        </div>
      )}
    </section>
  );
}
