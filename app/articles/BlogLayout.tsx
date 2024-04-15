import ArticleInfo from "components/ArticleInfo";
import { headers } from "next/headers";
import { getArticleBySlug } from "utils/getArticles";
import generateRandomGradient from "utils/generateRandomGradient";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = headers().get("x-next-article-slug") as string;
  const article = await getArticleBySlug(slug);
  const { metadata } = article;
  const title = String(metadata.title);
  const gradientStyle = {
    backgroundImage: generateRandomGradient(slug),
    minHeight: "200px",
  };

  return (
    <>
      <article className="bg-white backdrop-blur prose mx-auto lg:prose-xl px-4 sm:px-0">
        <div
          className="flex max-h-[50vh] justify-center items-center text-center"
          style={gradientStyle}
        >
          <h1 className="post-title">{title}</h1>
        </div>
        <div className="px-4">
          <ArticleInfo article={article} className="px-1 text-sm mb-5" />

          {children}
        </div>
      </article>
    </>
  );
}
