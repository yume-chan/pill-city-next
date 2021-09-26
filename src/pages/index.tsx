import { List, mergeStyleSets, Stack } from "@fluentui/react";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import getSession from "../utils/session";
import useStableCallback from "../utils/useConstCallback";
import useSWR from "swr";
import { Post } from "../utils/types";
// @ts-expect-error
import TimeAgo from "javascript-time-ago";
// @ts-expect-error
import ReactTimeAgo from "react-time-ago";
// @ts-expect-error
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

export interface HomeProps {}

const fetcher = (...args: any[]) =>
  fetch(...args)
    .then((res) => res.json())
    .then((response) => response.data);

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  const session = await getSession(req, res);
  const token = session.get("token") as string;
  if (!token) {
    return {
      redirect: {
        statusCode: 301,
        destination: "/login",
      },
    };
  }

  return {
    props: {},
  };
};

const Home: NextPage<HomeProps> = ({}) => {
  const styles = mergeStyleSets({
    content: {
      margin: "0 auto",
      maxWidth: 1200,
    },
    list: {
      width: 500,
    },
    post: {
      borderRadius: 4,
      marginTop: 20,
      padding: "12px 20px",
      boxShadow: "0 0 4px rgba(0,0,0,0.5)",
    },
    avatar: {
      borderRadius: "50%",
    },
    authorName: {
      fontWeight: 700,
    },
    image: {
      maxWidth: "100%",
      borderRadius: 4,
      border: "1px solid #ccc",
    },
  });

  const { data: list } = useSWR<Post[]>("/api/posts", fetcher);

  const renderPost = useStableCallback((post: Post | undefined) => {
    if (!post) {
      return null;
    }

    return (
      <Stack className={styles.post} tokens={{ childrenGap: 8 }}>
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Stack.Item>
            <Image
              className={styles.avatar}
              src={post.author.avatar_url || "https://pill.city/kusuou.png"}
              width={48}
              height={48}
              alt=""
            />
          </Stack.Item>
          <Stack.Item className={styles.authorName} grow>
            {post.author.id}
          </Stack.Item>
          <Stack.Item>
            <ReactTimeAgo
              date={post.created_at_seconds * 1000}
              polyfill={false}
              timeStyle="twitter-now"
            />
          </Stack.Item>
        </Stack>
        {post.content}
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          {post.media_urls.map((url, index) => (
            <Stack.Item key={index} grow>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.image} src={url} alt="" />
            </Stack.Item>
          ))}
        </Stack>
      </Stack>
    );
  });

  return (
    <div className={styles.content}>
      <Head>
        <title>Pill City</title>
      </Head>
      <List className={styles.list} items={list} onRenderCell={renderPost} />
    </div>
  );
};

export default Home;
