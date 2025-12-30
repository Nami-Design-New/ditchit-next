import { getPostDetails } from "@/features/post-details/service";
import { notFound } from "next/navigation";
import { getProfile } from "@/features/auth/actions";
import { getTranslations } from "next-intl/server";
import PageBanner from "@/components/shared/PageBanner";
import PostOwnerCard from "@/features/post-details/components/PostOwnerCard";
import DitchNote from "@/features/post-details/components/DitchNote";
import PostSlider from "@/features/post-details/components/PostSlider";
import PostInfo from "@/features/post-details/components/PostInfo";

interface PageProps {
  params: Promise<{
    postId: string;
  }>;
}

export const generateMetadata = async ({ params }: PageProps) => {
  const id = (await params).postId;
  const post = await getPostDetails(id);

  return {
    title: `DitchIt | ${post.title} `,
    description: post.description,
    openGraph: {
      title: `DitchIt | ${post.title} `,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
};

export default async function PostDetails({ params }: PageProps) {
  const id = (await params).postId;
  const { user } = await getProfile();
  const t = await getTranslations("common");
  const post = await getPostDetails(id, user?.id ?? null);

  const images: string[] = [
    ...(post.image ? [post.image] : []),
    ...post.images.map(({ image }) => image),
  ];

  if (!post) {
    notFound();
  }
console.log("post " , post);

  return (
    <>
      <PageBanner
        links={[
          { title: t("home"), link: "/" },
          { title: t("all_posts"), link: "/posts" },
        ]}
        page={post.title}
      />

      <div className="container py-6">
        <div className="flex flex-wrap ">
          <div className="w-full lg:w-8/12 px-2 py-2 flex flex-col gap-6">
            <PostSlider images={images} />
            <PostInfo post={post} />
          </div>

          <div className="w-full lg:w-4/12 px-2 py-2 flex flex-col gap-6">
            <PostOwnerCard owner={post.user.user} postId={post.id} />
            <DitchNote />
          </div>
        </div>
      </div>
    </>
  );
}
