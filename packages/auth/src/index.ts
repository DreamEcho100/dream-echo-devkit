import type { DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { db, tableCreator } from "@acme/db";

import { env } from "../env";

export type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, tableCreator),
  providers: [
    GitHubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
      account(account) {
        console.log("account", account);
        // https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens#refreshing-a-user-access-token-with-a-refresh-token
        const refresh_token_expires_at =
          Math.floor(Date.now() / 1000) +
          Number(account.refresh_token_expires_in);
        return {
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          refresh_token_expires_at,
        };
      },
    }),
  ],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable with session strategy";

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
  },
});
