import { List, mergeStyleSets, Stack } from "@fluentui/react";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import getSession from "../utils/session";
import useStableCallback from "../utils/useConstCallback";

interface Author {
  id: string;
  avatar_url: string;
  profile_pic: string;
}

interface Post {
  author: Author;
  circles: null[];
  comments: null[];
  content: string;
  created_at_seconds: number;
  id: string;
  is_public: boolean;
  media_urls: string[];
  reactions: string[];
  reshareable: boolean;
  reshared_from: null;
}

export interface HomeProps {
  list: Post[];
}

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

  const response = await fetch("https://api.pill.city/api/home", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();

  return {
    props: {
      list: json,
    },
  };
};

const Home: NextPage<HomeProps> = ({ list }) => {
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
      <List className={styles.list} items={list} onRenderCell={renderPost} />
    </div>
  );
};

export default Home;
