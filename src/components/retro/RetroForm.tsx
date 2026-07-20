import { createRetroAction, deleteRetroAction, updateRetroAction } from "@/actions/retros";
import { ChevronIcon } from "@/components/common/ChevronIcon";
import type { Retro } from "@/lib/sample-data";

type RetroFormProps = {
  retros: Retro[];
  projectId: string;
};

const authorLabel = {
  hyejin: "혜진",
  mingyoo: "민규",
};

function getCurrentWeekMonday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const day = weekdayMap[values.weekday];
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
  monday.setUTCDate(monday.getUTCDate() + diffToMonday);

  const year = monday.getUTCFullYear();
  const month = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const date = String(monday.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function RetroItem({ projectId, retro }: { projectId: string; retro: Retro }) {
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
            <input name="projectId" type="hidden" value={projectId} />
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
          <input name="projectId" type="hidden" value={projectId} />
          <input name="retroId" type="hidden" value={retro.id} />
          <button className="text-button text-button--danger" type="submit">
            삭제
          </button>
        </form>
      </div>
    </article>
  );
}

export function RetroForm({ retros, projectId }: RetroFormProps) {
  return (
    <div className="retro-layout">
      <section className="retro-panel">
        <h2>이번 주 회고 작성</h2>
        <form action={createRetroAction} className="retro-fields">
          <input name="projectId" type="hidden" value={projectId} />
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
            retros.map((retro) => <RetroItem key={retro.id} projectId={projectId} retro={retro} />)
          )}
        </div>
      </section>
    </div>
  );
}
