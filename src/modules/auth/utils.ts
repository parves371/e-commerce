import { cookies as getCookies } from "next/headers";

interface Props {
  prefix: string;
  value: string;
}

export const generateAuthCookie = async ({ prefix, value }: Props) => {
  const cookies = await getCookies();
  cookies.set({
    name: `${prefix}-token`, //payload-toekn by default
    value: value,
    httpOnly: true,
    path: "/",
    // sameSite: "none",
    // domain: process.env.NEXT_PUBLIC_APP_URL
    // TODO: ensure cross-domain cookie sharing
  });
};
