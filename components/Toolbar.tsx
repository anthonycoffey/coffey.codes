function ToolbarMenu() {
  return (
    <ul className="float-right flex flex-row p-1">
      <li className={"mx-2"}>
        <a href="/">Home</a>
      </li>
      <li className={"mx-2"}>
        <a href="/about">About</a>
      </li>
      <li className={"mx-2"}>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  );
}

export default function Toolbar() {
  return (
    <header className="flex px-4 py-8">
      <div className="logo text-2xl">
        <a href="/">{`<coffey.codes />`}</a>
      </div>
      <div className={"flex-1"}>
        <ToolbarMenu />
      </div>
    </header>
  );
}
