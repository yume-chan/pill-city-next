import { NextApiRequest, NextApiResponse } from "next";
import getSession from "../../utils/session";
import { CommonApiResponse } from "../../utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommonApiResponse<undefined>>
) {
  const session = await getSession(req, res);
  const token = session.get("token") as string;
  if (!token) {
    res.status(200).json({
      code: 401,
      message: "Unauthorized",
    });
    return;
  }

  const { from } = req.query;

  const query = new URLSearchParams();
  if (from) {
    query.set("from_id", from as string);
  }

  const response = await fetch(
    `https://api.pill.city/api/home?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    res.status(200).json({
      code: response.status,
      message: "Server Error",
    });
  }

  const list = await response.json();
  res.status(200).json({
    code: 0,
    message: "success",
    data: list,
  });
}
