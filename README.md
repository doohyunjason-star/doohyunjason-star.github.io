# Personal Homepage

검색엔진 비노출 설정: `index.html` 의 `<meta name="robots" content="noindex…">` + `robots.txt`

## 내용 수정

거의 모든 내용은 `js/data.js` 한 파일에 있습니다.

| 수정할 것 | `js/data.js` 안의 위치 |
|---|---|
| 이름 · 이메일 · 링크 · 사진 · CV 경로 | `SITE` |
| 자기소개 문단 | `HERO_PARAGRAPHS` |
| 연구 관심사 카드 | `INTERESTS` |
| 논문 (`status`: published / submitted / in-prep) | `PUBLICATIONS` |
| 학회 발표 | `CONFERENCES` |
| 뉴스 | `NEWS` |
| 학력 · 연구경력 | `EDUCATION`, `EXPERIENCE` |

논문·학회 발표 수, 홈 캐러셀은 자동으로 갱신됩니다.

## 파일 교체

- CV: `assets/Doohyun_Jason_Lee_CV.pdf` 에 같은 이름으로 덮어쓰기
- 프로필 사진: `assets/img/profile.jpg` 에 같은 이름으로 덮어쓰기

## 사이트에 반영하기

수정한 뒤 이 폴더에서:

```
git add -A
git commit -m "수정 내용 한 줄 요약"
git push
```

1~2분 뒤 사이트에 반영됩니다. (브라우저에서 안 바뀌어 보이면 Ctrl+Shift+R)
