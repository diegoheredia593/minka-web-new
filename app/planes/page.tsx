import type { Metadata } from 'next';

import { PlanesPage } from '@/components/planes-page';

export const metadata: Metadata = {
  title: 'Planes - Minka',
  description: 'Planes pensados para cada comunidad residencial en Ecuador.',
};

export default function Planes() {
  return <PlanesPage />;
}
