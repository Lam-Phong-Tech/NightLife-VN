import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;
  
  return {
    title: `Chi tiết quán ${slug} | NightLife VN`,
    description: `Khám phá thông tin, giá cả và đánh giá về quán ${slug} trên NightLife VN.`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
