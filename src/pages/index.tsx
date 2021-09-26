import { List, mergeStyleSets, Stack } from "@fluentui/react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
// @ts-expect-error
import ReactTimeAgo from "react-time-ago";
import useSWRInfinite from "swr/infinite";
import getSession from "../utils/session";
import { Post } from "../utils/types";
import useStableCallback from "../utils/useConstCallback";

TimeAgo.addDefaultLocale(en);

export interface HomeProps {}

const fetcher = (input: RequestInfo, init?: RequestInit | undefined) =>
  fetch(input, init)
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

function virtualFlatten<T>(
  array: T[][],
  start = 0,
  end?: number | undefined
): T[] {
  return new Proxy(array, {
    get(target, prop, receiver) {
      switch (prop) {
        case "length":
          if (end) {
            return end - start;
          }
          return target.reduce((sum, list) => sum + list.length, 0) - start;
        case "slice":
          return (start: number, end?: number) =>
            virtualFlatten(target, start, end);
      }

      if (typeof prop !== "string") {
        return Reflect.get(target, prop, receiver);
      }

      let index = Number.parseInt(prop, 10);
      if (Number.isNaN(index)) {
        return Reflect.get(target, prop, receiver);
      }

      index += start;
      for (const list of target) {
        if (index < list.length) {
          return list[index];
        }
        index -= list.length;
      }

      return undefined;
    },
    has(target, p) {
      if (typeof p !== "string") {
        return Reflect.has(target, p);
      }

      let index = Number.parseInt(p, 10);
      if (Number.isNaN(index)) {
        return Reflect.has(target, p);
      }

      for (const list of target) {
        if (index < list.length) {
          return true;
        }
        index -= list.length;
      }

      return false;
    },
  }) as unknown as T[];
}

function swrGetKey(index: number, previousPageData: Post[] | null) {
  if (previousPageData) {
    if (previousPageData.length === 0) {
      return null;
    } else {
      return `/api/posts?from=${previousPageData.at(-1)!.id}`;
    }
  } else {
    return "/api/posts";
  }
}

function listGetKey(item: Post) {
  return item.id;
}

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

  const { data, isValidating, size, setSize } = useSWRInfinite<Post[]>(
    swrGetKey,
    fetcher
  );

  const loading = useRef(false);
  useEffect(() => {
    if (!isValidating) {
      loading.current = false;
    }
  }, [isValidating]);

  const list = useMemo(() => data && virtualFlatten(data), [data]);

  const handleScroll = useStableCallback(() => {
    const scrollingElement = document.documentElement!;
    if (
      !loading.current &&
      scrollingElement.scrollTop + scrollingElement.clientHeight >=
        scrollingElement.scrollHeight - 5
    ) {
      loading.current = true;
      setSize(size + 1);
    }
  });

  useLayoutEffect(() => {
    window!.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

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
      <List
        className={styles.list}
        items={list}
        getKey={listGetKey}
        onRenderCell={renderPost}
      />
    </div>
  );
};

export default Home;
