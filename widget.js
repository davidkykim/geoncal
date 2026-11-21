// 건캘 위젯 (Scriptable)
// 홈 화면: 작게·중간·크게 / 잠금 화면: 직사각형·원형·한 줄
// 위젯을 누르면 건캘 앱이 열린다.
const API = "__API__";
const APP = "__APP__";

const fam = config.widgetFamily || "large";
const dark = Device.isUsingDarkAppearance();
const C = {
  bg: Color.dynamic(new Color("#FBFBFD"), new Color("#171D27")),
  ink: Color.dynamic(new Color("#161C28"), new Color("#E3E8F1")),
  muted: Color.dynamic(new Color("#5A6375"), new Color("#97A1B3")),
  accent: Color.dynamic(new Color("#2B4A7E"), new Color("#8FB0E8")),
  hot: Color.dynamic(new Color("#B83A2E"), new Color("#F08A7E")),
};
const WD = ["일", "월", "화", "수", "목", "금", "토"];
const md = s => { const [y, m, d] = s.split("-").map(Number); const t = new Date(y, m - 1, d); return `${m}.${d} (${WD[t.getDay()]})`; };
const dayLabel = e => e.inDays === 0 ? "오늘" : e.inDays === 1 ? "내일" : md(e.day);

let data = null;
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "geonkal-widget.json");
try {
  const r = new Request(API); r.timeoutInterval = 10;
  data = await r.loadJSON();
  if (!data || !Array.isArray(data.events)) throw new Error("bad");
  fm.writeString(cache, JSON.stringify(data));
} catch (e) {
  if (fm.fileExists(cache)) data = JSON.parse(fm.readString(cache));
}

const w = new ListWidget();
w.url = APP;
w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);

if (!data) {
  const t = w.addText("건캘 일정을 불러오지 못했어요");
  t.font = Font.systemFont(12); t.textColor = C.muted;
} else if (fam.startsWith("accessory")) {
  // 잠금 화면
  const ev = data.events;
  if (fam === "accessoryCircular") {
    const n = ev.filter(e => e.inDays === 0).length;
    w.addSpacer();
    const a = w.addText(String(n)); a.font = Font.boldSystemFont(22); a.centerAlignText();
    const b = w.addText("오늘"); b.font = Font.systemFont(10); b.centerAlignText();
    w.addSpacer();
  } else if (fam === "accessoryInline") {
    const e = ev[0];
    w.addText(e ? `${dayLabel(e)} ${e.allDay ? "" : e.startTime + " "}${e.title}` : "앞으로 2주 일정 없음");
  } else {
    const list = ev.slice(0, 3);
    if (!list.length) w.addText("앞으로 2주 일정 없음").font = Font.systemFont(12);
    for (const e of list) {
      const t = w.addText(`${dayLabel(e)} ${e.allDay ? "" : e.startTime + " "}${e.title}`);
      t.font = Font.systemFont(12); t.lineLimit = 1;
    }
  }
} else {
  w.backgroundColor = C.bg;
  const max = fam === "small" ? 4 : fam === "medium" ? 5 : 12;
  w.setPadding(12, 14, 12, 14);
  const head = w.addStack(); head.centerAlignContent();
  const h = head.addText("건캘"); h.font = Font.boldSystemFont(fam === "small" ? 13 : 15); h.textColor = C.accent;
  head.addSpacer();
  const [y, m, d] = data.today.split("-").map(Number);
  const td = head.addText(`${m}월 ${d}일 ${WD[new Date(y, m - 1, d).getDay()]}`); td.font = Font.systemFont(11); td.textColor = C.muted;
  w.addSpacer(6);

  const list = data.events.slice(0, max);
  if (!list.length) {
    const t = w.addText("앞으로 2주 동안 일정이 없어요"); t.font = Font.systemFont(12); t.textColor = C.muted;
  }
  let lastDay = "";
  for (const e of list) {
    const row = w.addStack(); row.centerAlignContent(); row.spacing = 6;
    if (fam !== "small") {
      const dl = row.addStack(); dl.size = new Size(fam === "large" ? 58 : 50, 0);
      const t = dl.addText(e.day === lastDay ? "" : dayLabel(e));
      t.font = Font.mediumSystemFont(11); t.textColor = e.inDays === 0 ? C.accent : C.muted; t.lineLimit = 1;
    }
    lastDay = e.day;
    const dot = row.addStack(); dot.size = new Size(4, 14); dot.cornerRadius = 2; dot.backgroundColor = new Color(e.color);
    const tx = row.addStack(); tx.layoutVertically();
    const title = tx.addText(e.title); title.font = Font.systemFont(fam === "small" ? 12 : 13); title.textColor = C.ink; title.lineLimit = 1;
    if (fam === "small") {
      const sub = tx.addText(`${dayLabel(e)}${e.allDay ? "" : " " + e.startTime}`); sub.font = Font.systemFont(10); sub.textColor = C.muted;
    }
    row.addSpacer();
    if (fam !== "small" && !e.allDay && e.startTime) { const tm = row.addText(e.startTime); tm.font = Font.systemFont(11); tm.textColor = C.muted; }
    if (e.deadline !== null && e.deadline !== undefined) {
      const b = row.addText(e.deadline === 0 ? "D-day" : `D-${e.deadline}`);
      b.font = Font.boldSystemFont(10); b.textColor = e.deadline <= 3 ? C.hot : C.muted;
    }
    w.addSpacer(fam === "large" ? 5 : 4);
  }
  if (data.events.length > max) {
    const more = w.addText(`+${data.events.length - max}개 더`); more.font = Font.systemFont(10); more.textColor = C.muted;
  }
  w.addSpacer();
}

if (config.runsInWidget) Script.setWidget(w);
else if (fam === "small") await w.presentSmall();
else if (fam === "medium") await w.presentMedium();
else await w.presentLarge();
Script.complete();
