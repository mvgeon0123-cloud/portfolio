import Nav from '@/components/Nav';
import Signature from '@/components/Signature';
import { supabase } from '@/lib/supabase';
import { channels } from '@/data/channels';

// DB 변경이 최대 60초 안에 반영되도록 ISR 재검증
export const revalidate = 60;

type ColumnRow = { title: string; source: string; url: string };

export default async function Home() {
  // Supabase columns 테이블에서 sort_order 오름차순으로 조회
  const { data, error } = await supabase
    .from('columns')
    .select('title, source, url')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[supabase] columns 조회 실패:', error.message);
  }
  const columns: ColumnRow[] = data ?? [];

  return (
    <>
      <Nav />

      <main id="top">
        <section className="hero">
          <Signature />
          <div className="row-links">
            <a className="arrow" href="#columns">
              Column <span className="c">›</span>
            </a>
            <a className="arrow" href="#channels">
              Instagram <span className="c">›</span>
            </a>
            <a className="arrow" href="#contact">
              Contact <span className="c">›</span>
            </a>
          </div>
        </section>

        <section id="columns">
          <div className="intro">
            <h2>Column</h2>
          </div>
          <div className="list">
            {columns.map((col) => (
              <a
                key={col.url}
                className="it"
                href={col.url}
                target="_blank"
                rel="noopener"
              >
                <div>
                  <div className="ti">{col.title}</div>
                  <div className="src">{col.source}</div>
                </div>
                <span className="c">›</span>
              </a>
            ))}
          </div>
          <div className="venues">
            <span className="vlabel">Columns at</span>
            <a className="u" href="https://yagongso.com/author/mvgeon0123/" target="_blank" rel="noopener">
              Yagongso
            </a>
            <a className="u" href="https://infieldreport.com" target="_blank" rel="noopener">
              Infield Report
            </a>
            <a className="u" href="https://blog.naver.com/phillies2011" target="_blank" rel="noopener">
              Blog
            </a>
          </div>
        </section>

        <section id="channels">
          <div className="intro">
            <h2>Instagram</h2>
          </div>
          <div className="g2">
            {channels.map((ch) => (
              <article key={ch.handle} className="tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pfp" src={ch.pfp} alt={ch.alt} />
                <h3>{ch.handle}</h3>
                <div className="lk-w">
                  <a className="arrow" href={ch.href} target="_blank" rel="noopener">
                    Instagram에서 보기 <span className="c">›</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap">
            <h2>Contact</h2>
            <a className="btn" href="mailto:mvgeon0123@naver.com">
              이메일 보내기
            </a>
            <div className="more">
              <a className="u" href="https://instagram.com/xiln3k" target="_blank" rel="noopener">
                Instagram · @xiln3k
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="in">
          <a href="#columns">Column</a>
          <a href="#channels">Instagram</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </>
  );
}
