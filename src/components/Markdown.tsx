import { Fragment } from "react";

function inline(text: string, keyPrefix: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em] text-lime">
          {token.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={key}>{token}</Fragment>;
  });
}

/** Small, dependency-free markdown renderer for AI answers. */
export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/```[a-z]*\n?/gi, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const items = list.items.map((item, i) => (
      <li key={i} className="pl-1">
        {inline(item, `li-${blocks.length}-${i}`)}
      </li>
    ));
    blocks.push(
      list.ordered ? (
        <ol key={`b${blocks.length}`} className="ml-5 list-decimal space-y-1.5 text-muted-foreground">
          {items}
        </ol>
      ) : (
        <ul key={`b${blocks.length}`} className="ml-5 list-disc space-y-1.5 text-muted-foreground">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      return;
    }
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (bullet) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1] ?? "");
      return;
    }
    if (numbered) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[2] ?? "");
      return;
    }
    flush();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1]!.length;
      const text = heading[2] ?? "";
      if (level <= 2) {
        blocks.push(
          <h3
            key={`b${blocks.length}`}
            className="mt-5 border-l-2 border-primary pl-3 font-display text-lg font-semibold text-foreground"
          >
            {text}
          </h3>,
        );
      } else {
        blocks.push(
          <h4
            key={`b${blocks.length}`}
            className="mt-4 text-sm font-semibold uppercase tracking-wide text-lime"
          >
            {text}
          </h4>,
        );
      }
      return;
    }
    blocks.push(
      <p key={`b${blocks.length}`} className="leading-relaxed text-muted-foreground">
        {inline(line, `p${blocks.length}`)}
      </p>,
    );
  });
  flush();

  return <div className="space-y-3 text-[0.95rem]">{blocks}</div>;
}
