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
    title: `Thông tin Cast ${slug} | NightLife VN`,
    description: `Xem profile, đánh giá và đặt lịch với cast ${slug} trên NightLife VN.`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
