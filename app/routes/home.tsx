import { json, LoaderFunction } from "@remix-run/node";
import { getUser, requireUserId } from "~/utils/auth.server";
import { Layout } from "~/components/layout";
import { UserPanel } from "~/components/user-panel";
import { getOtherUsers } from "~/utils/user.server";
import { useLoaderData, Outlet } from "@remix-run/react";
import { getFilteredKudos, getRecentKudos } from "~/utils/kudos.server";
import { Kudo } from "~/components/kudo";
import { Kudo as IKudo, Profile, Prisma } from "@prisma/client";
import { SearchBar } from "~/components/search-bar";
import { RecentBar } from "~/components/recent-bar";

interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);

  // Search Options
  const url = new URL(request.url);
  const sort = url.searchParams.get("sort");
  const filter = url.searchParams.get("filter");

  let sortOptions: Prisma.KudoOrderByWithRelationInput = {};

  console.log({ sort });

  if (sort) {
    if (sort === "date") {
      sortOptions = { createdAt: "desc" };
    }
    if (sort === "sender") {
      sortOptions = { author: { profile: { firstName: "asc" } } };
    }
    if (sort === "emoji") {
      sortOptions = { style: { emoji: "asc" } };
    }
  }

  let textFilter: Prisma.KudoWhereInput = {};
  if (filter) {
    textFilter = {
      OR: [
        { message: { mode: "insensitive", contains: filter } },
        {
          author: {
            OR: [
              {
                profile: {
                  is: { firstName: { mode: "insensitive", contains: filter } },
                },
              },
              {
                profile: {
                  is: { lastName: { mode: "insensitive", contains: filter } },
                },
              },
            ],
          },
        },
      ],
    };
  }

  const kudos = await getFilteredKudos(userId, sortOptions, textFilter);
  const recentKudos = await getRecentKudos();
  const user = await getUser(request);

  return json({ users, kudos, recentKudos, user });
};

export default function Home() {
  const { users, kudos, recentKudos, user } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} />
        <div className="flex-1 flex flex-col">
          {/* Search Bar Goes Here */}
          <SearchBar profile={user.profile} />
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            {/* Recent Kudos Goes Here */}
            <RecentBar kudos={recentKudos} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
