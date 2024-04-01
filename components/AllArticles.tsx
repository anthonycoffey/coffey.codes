import React from "react";
import { getAllArticles } from "utils/getArticles";
import Link from "next/link";
import ArticleInfo from "./ArticleInfo";
import generateRandomGradient from "utils/generateRandomGradient";

export default async function AllArticles() {
  const articles = await getAllArticles();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
      {articles.map((article) => {
        const { metadata, slug } = article;
        const title = String(metadata.title);
        const gradientStyle = {
          backgroundImage: generateRandomGradient(slug),
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
