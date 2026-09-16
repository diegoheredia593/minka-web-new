import type { Metadata } from "next";

import { MinkaLanding } from '@/components/minka-landing';

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <MinkaLanding />;
}
