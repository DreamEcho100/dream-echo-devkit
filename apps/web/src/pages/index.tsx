import Link from "next/link";
import { Button } from "ui";

export default function Web() {
  return (
    <div className="bg-black text-white">
      <h1>Web</h1>
			<Button />
			<nav>
				<ul>
					<li>
						<Link href='/devkit/react-table-query'>react-table-query</Link>
					</li>
				</ul>
			</nav>
    </div>
  );
}
