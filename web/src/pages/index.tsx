import Axios from "axios";
import Head from "next/head";
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";

import { Post } from "../types";

import PostCard from "../components/PostCard";

dayjs.extend(relativeTime);

export default function Home() {
  const { data: posts } = useSWR("/posts");

  return (
    <Fragment>
      <Head>
        <title>reddit: the front page of the internet</title>
      </Head>
      <div className="container flex pt-4">
        {/* Feed */}

        <div className="w-160">
          {posts?.map((post) => (
            <PostCard post={post} key={post.identifier} />
          ))}
        </div>

        {/* Sidebar */}
      </div>
    </Fragment>
  );
}

/**
 * Funciton that runs on the server side before the page is created & rendered.
 *
 * Can fetch data and send it to the page, before the page is rendered,
 * can render it with the fetched data oppose to client side rendering
 *
 */
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     const res = await axios.get("/posts");

//     return { props: { posts: res.data } };
//   } catch (err) {
//     return { props: { error: "Something went wrong" } };
//   }
// };
