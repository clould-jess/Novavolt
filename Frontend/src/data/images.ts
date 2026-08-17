/**
 * External stock imagery (Unsplash). No AI-generated vehicles.
 * Replace these URLs with your own CDN assets when the backend lands.
 */
const base = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  heroCar: base('photo-1560958089-b8a1929cea89', 1800),
  cityRoad: base('photo-1502877338535-766e1452684a', 1600),
  driverHero: base('photo-1503376780353-7e6692767b70', 1600),
  individualHero: base('photo-1449965408869-eaa3f722e40d', 1600),
  authVisual: base('photo-1617704548623-340376564e68', 1200),
  charging: base('photo-1593941707882-a5bba14938c7', 1200),
  interior: base('photo-1571607388263-1044f9ea01dd', 1200),
  fleet: base('photo-1568605117036-5fe5e7bab0b7', 1200),
  street: base('photo-1511919884226-fd3cad34687c', 1200),
  road: base('photo-1541899481282-d8bfbbe93476', 1600),
  suv: base('photo-1549317661-bd32c8ce0db2', 1200),
  compact: base('photo-1554744512-d6c603f27c54', 1200),
  sedan: base('photo-1617788138017-80ad40651399', 1200),
  crossover: base('photo-1583121274602-3e2820c69888', 1200),
  hatch: base('photo-1552519507-da3b142c6e3d', 1200)
} as const;

export type ImageKey = keyof typeof images;