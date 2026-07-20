import { createRetroAction, deleteRetroAction, updateRetroAction } from "@/actions/retros";
import { ChevronIcon } from "@/components/common/ChevronIcon";
import type { Retro } from "@/lib/sample-data";

type RetroFormProps = {
  retros: Retro[];
};

const authorLabel = {
  hyejin: "혜진",
  mingyoo: "민규",
};

function getCurrentWeekMonday() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return monday.toISOString().slice(0, 10);
}

function RetroItem({ retro }: { retro: Retro }) {
  return (
    <article className="retro-item">
      <div className="retro-item__meta">
        <strong>{authorLabel[retro.author]}</strong>
        <span>{retro.weekOf}</span>
      </div>
      <p className="retro-item__row retro-item__row--good"><b>Good</b> {retro.good}</p>
      <p className="retro-item__row retro-item__row--bad"><b>Bad</b> {retro.bad}</p>
      <p className="retro-item__row retro-item__row--next"><b>Next</b> {retro.nextAction}</p>

      <div className="item-actions">
        <details className="inline-disclosure">
          <summary className="inline-toggle">
            <ChevronIcon />
            수정
          </summary>
          <form action={updateRetroAction} className="inline-edit-body">
            <input name="retroId" type="hidden" value={retro.id} />
            <label>
              <span>작성자</span>
              <select className="input" defaultValue={retro.author} name="author">
                <option value="mingyoo">민규</option>
                <option value="hyejin">혜진</option>
              </select>
            </label>
            <label>
              <span>주차 (월요일 날짜)</span>
              <input className="input" defaultValue={retro.weekOf} name="weekOf" required type="date" />
            </label>
            <label>
              <span>잘한 점</span>
              <textarea defaultValue={retro.good} name="good" required />
            </label>
            <label>
              <span>아쉬운 점</span>
              <textarea defaultValue={retro.bad} name="bad" required />
            </label>
            <label>
              <span>다음 액션</span>
              <textarea defaultValue={retro.nextAction} name="nextAction" required />
            </label>
            <button className="primary-button" type="submit">
              수정 저장
            </button>
          </form>
        </details>

        <form action={deleteRetroAction}>
          <input name="retroId" type="hidden" value={retro.id} />
          <button className="text-button text-button--danger" type="submit">
            삭제
          </button>
        </form>
      </div>
    </article>
  );
}

export function RetroForm({ retros }: RetroFormProps) {
  return (
    <div className="retro-layout">
      <section className="retro-panel">
        <h2>이번 주 회고 작성</h2>
        <form action={createRetroAction} className="retro-fields">
          <label>
            <span>작성자</span>
            <select className="input" defaultValue="mingyoo" name="author">
              <option value="mingyoo">민규</option>
              <option value="hyejin">혜진</option>
            </select>
          </label>
          <label>
            <span>주차 (월요일 날짜)</span>
            <input
              className="input"
              defaultValue={getCurrentWeekMonday()}
              name="weekOf"
              required
              type="date"
            />
          </label>
          <label>
            <span>잘한 점</span>
            <textarea name="good" placeholder="이번 주에 잘한 점을 적어보세요." required />
          </label>
          <label>
            <span>아쉬운 점</span>
            <textarea name="bad" placeholder="아쉬웠던 점을 적어보세요." required />
          </label>
          <label>
            <span>다음 액션</span>
            <textarea name="nextAction" placeholder="다음 주에 바로 실행할 액션을 적어보세요." required />
          </label>
          <button className="primary-button" type="submit">
            저장
          </button>
        </form>
      </section>

      <section className="retro-panel">
        <h2>회고 기록</h2>
        <div className="retro-list">
          {retros.length === 0 ? (
            <div className="empty-state">아직 회고가 없어.</div>
          ) : (
            retros.map((retro) => <RetroItem key={retro.id} retro={retro} />)
          )}
        </div>
      </section>
    </div>
  );
}
