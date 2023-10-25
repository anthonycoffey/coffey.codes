import ArticleInfo from "components/ArticleInfo";
import { headers } from "next/headers";
import Image from "next/image";
import { getArticleBySlug } from "utils/getArticles";
import Toolbar from "../../components/Toolbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = headers().get("x-next-article-slug") as string;
  const article = await getArticleBySlug(slug);
  const { metadata } = article;
  const image = metadata.image;

  return (
    <>
      <article className="prose mx-auto lg:prose-xl px-4 sm:px-0">
        {image && (
          <div className="flex max-h-[60vh] justify-center">
            <Image
              src={image}
              alt={String(metadata.title)}
              width={1200}
              height={630}
              className="rounded-md object-scale-down m-0"
            />
          </div>
        )}
        <ArticleInfo article={article} className="px-1 text-sm mb-5" />
        {children}
      </article>
    </>
  );
}
