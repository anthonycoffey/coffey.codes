import ArticleInfo from "components/ArticleInfo";
import { headers } from "next/headers";
import { getArticleBySlug } from "utils/getArticles";
import Toolbar from "../../components/Toolbar";

const generateRandomGradient = () => {
  const colors = [
    "#FFC0CB", // Pink
    "#FFD700", // Gold
    "#00FFFF", // Aqua
    "#8A2BE2", // BlueViolet
    "#FF4500", // OrangeRed
    "#7FFF00", // Chartreuse
    "#FF1493", // DeepPink
    "#00BFFF", // DeepSkyBlue
  ];
  const angle = Math.floor(Math.random() * 360);
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = headers().get("x-next-article-slug") as string;
  const article = await getArticleBySlug(slug);
  const { metadata } = article;
  const gradientStyle = {
    backgroundImage: generateRandomGradient(),
    minHeight: "250px",
  };

  return (
    <>
      <article className="prose mx-auto lg:prose-xl px-4 sm:px-0">
        <div
          className="flex max-h-[50vh] justify-center items-center text-center"
          style={gradientStyle}
        >
          <h1 className="post-title">{metadata.title}</h1>
        </div>
        <ArticleInfo article={article} className="px-1 text-sm mb-5" />
        {children}
      </article>
    </>
  );
}
