import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  ChangeEvent,
  createRef,
  Fragment,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";
import PostCard from "../../components/PostCard";
import Image from "next/image";
import classNames from "classnames";
import Axios from "axios";
import Sidebar from "../../components/Sidebar";

import { Sub } from "../../types";
import { useAuthState } from "../../context/auth";

export default function SubPage() {
  // Local state

  /**
   * Needs to be a useEffect hook, don't have sub in the beginning
   */
  const [ownSub, setOwnSub] = useState(false);
  // Global state
  const { authenticated, user } = useAuthState();

  // Utils
  const router = useRouter();
  const fileInputRef = createRef<HTMLInputElement>();

  const subName = router.query.sub;

  /**
   * Would fail because at first object it null
   *
   * can do conditional fetching
   *
   * revalidate - function that sends a request to revalidate data & gets new data
   */
  const {
    data: sub,
    error,
    revalidate,
  } = useSWR<Sub>(subName ? `/subs/${subName}` : null);

  useEffect(() => {
    if (!sub) return;
    setOwnSub(authenticated && user.username === sub.username);
  }, [sub]);

  /**
   * Access reference & set field on top of input
   */
  const openFileInput = (type: string) => {
    if (!ownSub) return;
    fileInputRef.current.name = type;
    fileInputRef.current.click();
  };

  /**
   * uploads the file
   *
   * Get the first uploaded file and set it to file
   *
   * create an instance of FormData
   *  - append the file & type
   *
   * Send to the server
   *  - set the content type in the headers
   */
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileInputRef.current.name);

    try {
      await Axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  /** If there's an error, redirect to home */
  if (error) router.push("/");

  let postsMarkup;
  if (!sub) {
    postsMarkup = <p className="text-lg text-center">Loading...</p>;
  } else if (sub.posts.length === 0) {
    postsMarkup = <p className="text-lg text-center">No posts submitted yet</p>;
  } else {
    postsMarkup = sub.posts.map((post) => (
      <PostCard key={post.identifier} post={post} />
    ));
  }

  return (
    <div>
      <Head>
        <title>{sub?.title}</title>
      </Head>
      {sub && (
        <Fragment>
          {/* Sub info & images */}
          <input
            type="file"
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />
          <div>
            {/* Banner image */}
            <div
              className={classNames("bg-blue-500", {
                "cursor-pointer": ownSub,
              })}
              onClick={() => openFileInput("banner")}
            >
              {sub.bannerUrl ? (
                <div
                  className="h-56 bg-blue-500"
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              ) : (
                <div className="h-20 bg-blue-500"></div>
              )}
            </div>
            {/* Sub metadata */}
            <div className="h-20 bg-white">
              <div className="container relative flex">
                <div className="absolute" style={{ top: -15 }}>
                  <Image
                    src={sub.imageUrl}
                    alt="Sub"
                    className={classNames("rounded-full", {
                      "cursor-pointer": ownSub,
                    })}
                    onClick={() => openFileInput("image")}
                    width={70}
                    height={70}
                  />
                </div>
                <div className="pt-1 pl-24">
                  <div className="flex items-center">
                    <h1 className="mb-1 text-3xl font-bold">{sub.title}</h1>
                  </div>
                  <p className="text-sm text-gray-500">/r/{sub.name}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Posts & sidebar */}
          <div className="container flex pt-5">
            <div className="w-160">{postsMarkup}</div>
            <Sidebar sub={sub}></Sidebar>
          </div>
        </Fragment>
      )}
    </div>
  );
}
