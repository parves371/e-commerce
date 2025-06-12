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
    // this enables the cookie auth on loaclhost
    // but it will not work whit subdomains truned on
    ...(process.env.NODE_ENV !== "development" && {
      sameSite: "none",
      secure: true,
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    }),
  });
};
