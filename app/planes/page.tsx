import type { Metadata } from 'next';

import { PlanesPage } from '@/components/planes-page';

export const metadata: Metadata = {
  title: 'Solución a medida',
  description:
    'Una propuesta de Minka ajustada a la capacidad y necesidades de cada urbanización, condominio o edificio.',
  alternates: { canonical: '/planes' },
  robots: { index: false, follow: true },
};

export default function Planes() {
  return <PlanesPage />;
}
