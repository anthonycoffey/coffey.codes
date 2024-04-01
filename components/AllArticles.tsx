import React from "react";
import { getAllArticles } from "utils/getArticles";
import Link from "next/link";
import ArticleInfo from "./ArticleInfo";

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

export default async function AllArticles() {
  const articles = await getAllArticles();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
      {articles.map((article) => {
        const { metadata } = article;
        const title = String(metadata.title);
        const gradientStyle = {
          backgroundImage: generateRandomGradient(),
          minHeight: "250px",
        };

        return (
          <Link
            key={title}
            href={"/articles/" + article.slug}
            className="flex flex-col overflow-hidden rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-lg"
          >
            <div
              className="w-full flex items-center justify-center text-center p-4"
              style={gradientStyle}
            >
              <h3 className="post-title">{title}</h3>
            </div>
            <div className="p-2 m-2">
              <ArticleInfo article={article} className="-mt-2 mb-2 text-xs" />
              {/*<div className="mb-2 text-xl font-bold">{title}</div>*/}
              <p className="text-base text-gray-700">{metadata.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
