import ArticleInfo from "components/ArticleInfo";
import { headers } from "next/headers";
import { getArticleBySlug } from "utils/getArticles";

const generateRandomGradient = (seed) => {
  const colorPairs = [
    ["#f6d365", "#fda085"], // Pastel yellow to pastel orange
    ["#fbc2eb", "#a6c1ee"], // Pastel pink to pastel blue
    ["#e0c3fc", "#8ec5fc"], // Pastel purple to pastel sky blue
    ["#ffecd2", "#fcb69f"], // Pastel peach to pastel orange
    ["#a1c4fd", "#c2e9fb"], // Pastel blue to pastel cyan
    ["#fed6e3", "#a8edea"], // Pastel pink to pastel aqua
  ];

  // Ensure the seed is a string
  const validSeed = typeof seed === "string" ? seed : "";

  // Simple hash function to generate a pseudo-random number based on the seed
  const hash = Array.from(validSeed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );

  const index = hash % colorPairs.length;
  const [color1, color2] = colorPairs[index];
  return `radial-gradient(circle at 50% 50%, ${color1}, ${color2})`;
};

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
      <article className="prose mx-auto lg:prose-xl px-4 sm:px-0">
        <div
          className="flex max-h-[50vh] justify-center items-center text-center"
          style={gradientStyle}
        >
          <h1 className="post-title">{title}</h1>
        </div>
        <ArticleInfo article={article} className="px-1 text-sm mb-5" />
        {children}
      </article>
    </>
  );
}
