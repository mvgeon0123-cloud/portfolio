// 칼럼 목록 — 나중에 DB로 교체하기 쉽게 배열로 분리.
export type Column = {
  title: string;
  href: string;
  source: string;
};

export const columns: Column[] = [
  {
    title: '정말 어깨는 쓸수록 약해질까?',
    href: 'https://yagongso.com/does-the-shoulder-really-get-weaker-the-more-you-use-it/',
    source: 'Yagongso / 이동건',
  },
  {
    title: '잭 네토는 어떻게 20홈런을 칠 수 있었을까?',
    href: 'https://infieldreport.com/?p=2493',
    source: 'Infield Report / 콜해멀스',
  },
  {
    title: '저스틴 벌랜더는 어떻게 불혹의 나이에도 빠른 공을 던질까?',
    href: 'https://yagongso.com/how-does-justin-verlander-throw-his-fastball-at-his-40th-birthday/',
    source: 'Yagongso / 이동건',
  },
  {
    title: '이 선수들은 왜 변화구를 못 던질까?',
    href: 'https://yagongso.com/%EC%9D%B4-%EC%84%A0%EC%88%98%EB%93%A4%EC%9D%80-%EC%99%9C-%EB%B3%80%ED%99%94%EA%B5%AC%EB%A5%BC-%EB%AA%BB-%EB%8D%98%EC%A7%88%EA%B9%8C/',
    source: 'Yagongso / 이동건',
  },
  {
    title: '화성에서도 야구를 할 수 있을까?',
    href: 'https://yagongso.com/%ED%99%94%EC%84%B1%EC%97%90%EC%84%9C%EB%8F%84-%EC%95%BC%EA%B5%AC%EB%A5%BC-%ED%95%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C/',
    source: 'Yagongso / 이동건',
  },
];
