import Image from "next/image";
function ToolbarMenu() {
  return (
    <div className={"flex flex-1 items-center justify-end w-1/2"}>
      <ul className="flex flex-row justify-between [&>*]:mx-3">
        <li className="hover:underline">
          <a href="/">Home</a>
        </li>
        <li className="hover:underline">
          <a href="/about">About</a>
        </li>
        <li className="hover:underline">
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
    <header className="flex sm:p-2 p-4 container mx-auto">
      <Logo />
      <ToolbarMenu />
    </header>
  );
}
