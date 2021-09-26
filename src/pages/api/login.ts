import type { NextApiRequest, NextApiResponse } from "next";
import getSession from "../../utils/session";
import { CommonApiResponse } from "../../utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommonApiResponse<undefined>>
) {
  const { userId, password } = req.body;

  const response = await fetch("https://api.pill.city/api/signIn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: userId,
      password,
    }),
  });

  const { message, access_token } = await response.json();

  if (message) {
    res.status(200).json({
      code: 1,
      message,
    });
  } else {
    const session = await getSession(req, res);
    session.set("token", access_token);
    await session.save();
    res.status(200).json({
      code: 0,
      message: "success",
    });
  }
}
