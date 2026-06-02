// 인스타그램 채널 — 나중에 DB로 교체하기 쉽게 배열로 분리.
export type Channel = {
  handle: string;
  href: string;
  pfp: string;
  alt: string;
};

export const channels: Channel[] = [
  {
    handle: '@foreverdinos',
    href: 'https://instagram.com/foreverdinos',
    pfp: '/pfp-foreverdinos.png',
    alt: '@foreverdinos',
  },
  {
    handle: '@itsjustplaying',
    href: 'https://instagram.com/itsjustplaying',
    pfp: '/pfp-itsjustplaying.png',
    alt: '@itsjustplaying',
  },
];
