import { createTaskAction } from "@/actions/tasks";

export function AddTaskForm() {
  return (
    <section className="task-create-panel">
      <div>
        <p className="eyebrow">new task</p>
        <h2>할 일 추가</h2>
        <p className="muted">
          지금 단계에서는 제목 + 담당자만 입력해서 Todo로 넣고, 이후 상태 변경으로 흐름을 확인합니다.
        </p>
      </div>

      <form action={createTaskAction} className="task-create-form">
        <label>
          <span>할 일 제목</span>
          <input
            className="input"
            maxLength={120}
            name="title"
            placeholder="예: 보드 카드 상태 변경 UX 정리"
            required
          />
        </label>

        <label>
          <span>담당자</span>
          <select className="input" defaultValue="mingyoo" name="assignee">
            <option value="mingyoo">민규</option>
            <option value="hyejin">혜진</option>
          </select>
        </label>

        <button className="primary-button" type="submit">
          Todo에 추가
        </button>
      </form>
    </section>
  );
}
