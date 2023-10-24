import AllArticles from "components/AllArticles";
import Toolbar from "components/Toolbar";

export default async function Page() {
  return (
    <div className="container mx-auto h-screen bg-gray-200 px-2">
      <Toolbar />
      <AllArticles />
    </div>
  );
}
