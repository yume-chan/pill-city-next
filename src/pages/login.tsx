import {
  initializeIcons,
  mergeStyleSets,
  PrimaryButton,
  Text,
  TextField,
} from "@fluentui/react";
import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import getSession from "../utils/session";
import useStableCallback from "../utils/useConstCallback";

initializeIcons();

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);
  if (session.get("token")) {
    return {
      redirect: {
        statusCode: 301,
        destination: "/",
      },
    };
  }

  return {
    props: {},
  };
};

const Login: NextPage = () => {
  const styles = mergeStyleSets({
    form: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: 360,
      borderRadius: 4,
      padding: "40px 40px",
      boxShadow: "0 0 4px rgba(0,0,0,0.5)",
    },
    title: {
      marginBottom: 20,
    },
    button: {
      marginTop: 20,
    },
  });

  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userIdError, setUserIdError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleUserIdChange = useStableCallback(
    (ev: unknown, value: string = "") => {
      setUserId(value);
    }
  );

  const handlePasswordChange = useStableCallback(
    (ev: unknown, value: string = "") => {
      setPassword(value);
    }
  );

  const handleLoginClick = useStableCallback(async () => {
    if (!userId) {
      setUserIdError("User ID is required");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        password,
      }),
    });
    const json = await response.json();
    if (json.code !== 0) {
      setUserIdError(json.message);
      return;
    }

    router.replace("/");
  });

  return (
    <div className={styles.form}>
      <Head>
        <title>Login / Pill City</title>
      </Head>

      <Text className={styles.title} block variant="xxLarge">
        Log Into Pill City
      </Text>

      <TextField
        label="User ID"
        placeholder="User ID"
        value={userId}
        errorMessage={userIdError}
        onChange={handleUserIdChange}
      />

      <TextField
        label="Password"
        type="password"
        canRevealPassword
        placeholder="Password"
        value={password}
        errorMessage={passwordError}
        onChange={handlePasswordChange}
      />

      <PrimaryButton className={styles.button} onClick={handleLoginClick}>
        Login
      </PrimaryButton>
    </div>
  );
};

export default Login;
