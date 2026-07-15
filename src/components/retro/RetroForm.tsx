import type { Retro } from "@/lib/sample-data";

type RetroFormProps = {
  retros: Retro[];
};

const authorLabel = {
  hyejin: "혜진",
  mingyoo: "민규",
};

export function RetroForm({ retros }: RetroFormProps) {
  return (
    <div className="retro-layout">
      <section className="retro-panel">
        <h2>이번 주 회고 작성</h2>
        <div className="retro-fields">
          <label>
            <span>잘한 점</span>
            <textarea placeholder="이번 주에 잘한 점을 적어보세요." />
          </label>
          <label>
            <span>아쉬운 점</span>
            <textarea placeholder="아쉬웠던 점을 적어보세요." />
          </label>
          <label>
            <span>다음 액션</span>
            <textarea placeholder="다음 주에 바로 실행할 액션을 적어보세요." />
          </label>
        </div>
        <button className="primary-button" type="button">
          저장 (다음 단계)
        </button>
      </section>

      <section className="retro-panel">
        <h2>샘플 회고 기록</h2>
        <div className="retro-list">
          {retros.map((retro) => (
            <article key={retro.id} className="retro-item">
              <div className="retro-item__meta">
                <strong>{authorLabel[retro.author]}</strong>
                <span>{retro.weekOf}</span>
              </div>
              <p><b>Good</b> {retro.good}</p>
              <p><b>Bad</b> {retro.bad}</p>
              <p><b>Next</b> {retro.nextAction}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
