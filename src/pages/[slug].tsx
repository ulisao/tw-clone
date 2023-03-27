import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import superjson from "superjson"
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { Layout } from "~/components/Layout";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if (!data) return <div>404 not found</div>

  return (
    <>
      <Head>
        <title>Emoter | {username}</title>
      </Head>
      <Layout>
        <div className="h-36 bg-slate-600 relative">
        <Image 
        src={data.profileImageUrl}
        alt={`${data.username ?? ""}'s profile pic`}
        height={128}
        width={128}
        className="-mb-[64px] rounded-full border-4 border-black bg-black absolute bottom-0 left-0 ml-4"
        />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">
          {`@${data.username ?? ""}`}
        </div>
        <div className="border-b border-slate-400 w-full">

        </div>
        
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
  router: appRouter,
  ctx: { prisma, userId: null },
  transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug

  if (typeof slug !== "string") throw new Error("no slug")

  const username = slug.replace("@", "")

  await ssg.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    }
  }
}

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"}
}

export default ProfilePage;
