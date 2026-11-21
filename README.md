# 건캘

나만 쓰는 일정 앱. 아이폰 홈 화면에 설치해서 쓴다(PWA). 일정은 Supabase에 저장된다.

## 경외와 거룩 (`gyeongoe/`)

묵상·설교·교육·독서·메모·기도·일정 노트 앱. 같은 Supabase 프로젝트를 쓴다. 기록은 `jb_docs` 표, 일정은 건캘과 같은 `docs` 표에 저장된다. 주소: `https://davidkykim.github.io/geoncal/gyeongoe/`

## 찬양팀 메트로놈 (`metronome/`)

예배 송폼에 맞춰 파트 이름을 불러 주는 메트로놈. 같은 주소 아래 `metronome/`에 있고, 따로 홈 화면에 설치한다.
노래·재생목록·설정은 기기에 먼저 저장하고, 로그인하면 Supabase 표 `metro_docs`(건캘과 같은 계정)로 맞춘다.
