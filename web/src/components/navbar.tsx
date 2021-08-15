import React from "react";
import Link from "next/link";
import RedditLogo from "../../public/img/reddit.svg";

const Navbar: React.FC = () => (
  <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-center h-12 px-5 bg-white">
    {/* logo & title */}
    <div className="flex items-center">
      <Link href="/">
        <a>
          <RedditLogo className="w-8 h-8 mr-2" />
        </a>
      </Link>
      <span className="font-semibold test-2x">
        <Link href="/">reddit</Link>
      </span>
    </div>
    {/* search input */}
    <div className="flex items-center mx-auto bg-gray-100 border rounded hover:bg-white hover:border-blue-500">
      <i className="pl-4 pr-3 text-gray-500 fas fa-search "></i>
      <input
        type="text"
        className="py-1 pr-3 bg-transparent rounded w-160 focus:outline-none"
        placeholder="Search"
      />
    </div>
    {/* login / signup */}
    <div className="flex">
      <Link href="/login">
        <a className="w-32 py-1 mr-4 leading-5 hollow blue button">log in</a>
      </Link>

      <Link href="/register">
        <a className="w-32 py-1 leading-5 blue button">sign up</a>
      </Link>
    </div>
  </div>
);

export default Navbar;
