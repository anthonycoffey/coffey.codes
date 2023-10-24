import AllArticles from "components/AllArticles";
import Toolbar from "components/Toolbar";

export default async function Page() {
  return (
    <div className="bg-gray-200 h-screen container mx-auto">
      <Toolbar/>
      <AllArticles/>
    </div>
  );
}
