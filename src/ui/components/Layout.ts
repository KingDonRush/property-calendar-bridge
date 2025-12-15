import { renderHeader, renderNavigation } from "./Navigation";
import { renderHtmlHead } from "../utils/htmlHead";

export type LayoutOptions = {
  title: string;
  activePath: string;
  content: string;
};

export function renderLayout(options: LayoutOptions): string {
  const head = renderHtmlHead({ title: options.title });
  const header = renderHeader();
  const nav = renderNavigation(options.activePath);

  return `<!doctype html>
<html lang="pt-BR">
${head}
<body>
  <div class="container">
    ${header}
    ${nav}
    <div style="height: 16px"></div>
    <div class="card">
      ${options.content}
    </div>
  </div>
</body>
</html>`;
}

