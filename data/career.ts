// 경력·수료 이력 — 나중에 항목이 늘면 여기에만 추가. 최신이 앞.
export type CareerItem = {
  title: string;
  org?: string;
  note?: string;
  url?: string;
};

export const career: CareerItem[] = [
  {
    title: '한국미래일보 기자단',
    url: 'https://koreafuture.co.kr/news/search.php?&sm=w_writer_name&stx=%EC%9D%B4%EB%8F%99%EA%B1%B4&stx2=&w_section1=&sdate=&edate=&page=2',
  },
  {
    title: 'WCBC 한국 대학 대표팀 스카우팅 리포트 작성',
    org: '2026 세계대학야구선수권대회 미국 대표팀',
    url: 'https://www.usabaseball.com/news/inaugural-world-collegiate-baseball-championship-set-for-july-11-15-in-taichung-city',
  },
  {
    title: '디에고베이스볼 고교야구 기록 프로젝트 참여',
  },
];
