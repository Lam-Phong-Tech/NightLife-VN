import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi tiết Blog | NightLife VN',
  description: 'Đọc những bài viết, tin tức, và xu hướng mới nhất về NightLife tại Việt Nam.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
