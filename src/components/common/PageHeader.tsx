import Link from "next/link";
import { logout } from "@/actions/auth";
import { AppInfoMenu } from "@/components/common/AppInfoMenu";
import type { ProjectSource } from "@/lib/projects";

type PageHeaderProps = {
  title: string;
  pathLabel: string;
  currentProjectSlug?: string;
  currentProjectName?: string;
  projectSource?: ProjectSource;
};

export function PageHeader({
  title,
  pathLabel,
  currentProjectSlug,
  currentProjectName,
  projectSource,
}: PageHeaderProps) {
  const projectQuery = currentProjectSlug ? `?project=${encodeURIComponent(currentProjectSlug)}` : "";

  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{pathLabel}</p>
        <h1 className="section-title">{title}</h1>
      </div>
      <div className="page-header__actions">
        <nav>
          <Link className="nav-pill" href="/">
            홈
          </Link>
          <Link className="nav-pill" href={`/board${projectQuery}`}>
            보드
          </Link>
          <Link className="nav-pill" href={`/retro${projectQuery}`}>
            회고
          </Link>
        </nav>
        <AppInfoMenu projectName={currentProjectName} projectSource={projectSource} />
        <form action={logout}>
          <button className="nav-pill nav-pill--button" type="submit">
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
