export default function Toolbar() {
  return (
    <header className="flex px-4 py-8">
      <div className="logo text-2xl">
        {`<coffey.codes />`}
        {/*<img src='https://picsum.photos/400/100' alt={'logo'} />*/}
      </div>
      <div className={"flex-1"}>
        <ul className="float-right flex flex-row p-1">
          <li className={"mx-2"}>
            <a href="#">Home</a>
          </li>
          <li className={"mx-2"}>
            <a href="#">About</a>
          </li>
          <li className={"mx-2"}>
            <a href="#">Blog</a>
          </li>
          <li className={"mx-2"}>
            <a href="#">Contact</a>
          </li>
        </ul>
      </div>
    </header>
  );
}
