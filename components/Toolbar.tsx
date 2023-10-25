import Image from "next/image";
function ToolbarMenu() {
  return (
    <div className={"flex-1"}>
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
    </div>
  );
}

function Logo() {
  return (
    <div className="logo text-2xl">
      <a href="/">
        {`<coffey.codes/>`}
        {/*<Image src="/logo.svg" width={300} height={300} alt={"logo"} />*/}
      </a>
    </div>
  );
}

export default function Toolbar() {
  return (
    <header className="flex p-8">
      <Logo />
      <ToolbarMenu />
    </header>
  );
}
