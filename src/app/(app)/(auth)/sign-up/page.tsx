import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";
const page = async () => {
  const session = await caller.auth.session();

  if (session.user) {
    redirect("/");
  }
  return <SignUpView />;
};

export default page;
