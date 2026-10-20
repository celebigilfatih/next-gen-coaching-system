// Stable manifest identities, not titles or a client-supplied publication list.
export const starterDrillIds = ['u12', 'u14', 'u16', 'u18', 'senior'].flatMap(
  (age) =>
    Array.from(
      { length: 24 },
      (_, index) =>
        `ngcs-starter-v1-${age}-${String(index + 1).padStart(2, '0')}`,
    ),
);
