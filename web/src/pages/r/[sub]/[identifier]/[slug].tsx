import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import useSWR from "swr";
import classNames from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Post } from "../../../../types";
import Sidebar from "../../../../components/Sidebar";
import Axios from "axios";
import { useAuthState } from "../../../../context/auth";

dayjs.extend(relativeTime);

export default function PostPage() {
  // Local state

  // Global state
  const { authenticated } = useAuthState();

  // Utils
  const router = useRouter();
  const { identifier, sub, slug } = router.query;

  /**
   * don't want to fetch right away, identifier & slug can be null
   *
   * redirect to home page if error is found
   */
  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null
  );

  /** Destructure post */
  const {
    title,
    body,
    subName,
    voteScore,
    createdAt,
    userVote,
    commentCount,
    url,
    username,
  } = post;

  if (error) router.push("/");

  const vote = async (value: number) => {
    /**
     * If user isn't logged in -> redirect to login page
     */
    if (!authenticated) router.push("/login");
    /**
     * If vote is the same -> reset vote
     *
     */
    if (value === userVote) value = 0;
    try {
      const res = await Axios.post("/misc/vote", {
        identifier: identifier,
        slug,
        value,
      });

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Link href={`/r/${sub}`}>
        <a>
          <div className="flex items-center w-full h-20 p-8 bg-blue-500">
            <div className="container flex">
              {post && (
                <div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
                  <Image
                    src={post.sub.imageUrl}
                    height={(8 * 16) / 4}
                    width={(8 * 16) / 4}
                  ></Image>
                </div>
              )}
              <p className="text-xl font-semibold text-white">/r/{sub}</p>
            </div>
          </div>
        </a>
      </Link>
      <div className="container flex pt-5">
        {/* Post */}
        <div className="w-160">
          <div className="bg-white rounded">
            {post && (
              <div className="flex">
                {/* vote section */}
                <div className="w-10 py-3 text-center rounded-l">
                  {/* Upvote */}
                  <div
                    className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                    onClick={() => vote(1)}
                  >
                    <i
                      className={classNames("icon-arrow-up", {
                        "text-red-500": userVote === 1,
                      })}
                    ></i>
                  </div>
                  <p className="text-xs font-bold">{voteScore}</p>
                  {/* Downvote */}
                  <div
                    className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                    onClick={() => vote(-1)}
                  >
                    <i
                      className={classNames("icon-arrow-down", {
                        "text-blue-600": userVote === -1,
                      })}
                    ></i>
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500">
                      <span className="mx-1">•</span>
                      Posted by
                      <Link href={`/u/${username}`}>
                        <a className="mx-1 hover:underline">/u/{username}</a>
                      </Link>
                      <Link href={url}>
                        <a className="mx-1 hover:underline">
                          {dayjs(createdAt).fromNow()}
                        </a>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Sidebar */}
        {post && <Sidebar sub={post.sub} />}
      </div>
    </>
  );
}
