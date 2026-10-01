# 미션 9-1 계측 계약

## 이벤트와 도구

Amplitude는 제품 행동을 기록하고 GA4는 유입과 연락 버튼 클릭 세션을 비교한다.
아래 9개 논리 이벤트를 사용한다. 기존 첫 이벤트 수신 검증을 보존하기 위해 홈의
`page_view`만 Amplitude에서 `Viewed Home Page`와 `prompt_version: BA400.4`로
매핑한다. 홈에서 두 이름을 동시에 보내지 않는다. 다른 화면은 `page_view`다.
홈 방문 UU는 이 홈 이벤트와 다른 소비자 경로의 `page_view`를 함께 사용한다.
GA4에서는 홈을 포함해 표준 `page_view`를 사용한다.

| 논리 이벤트 | 발생 조건 | 허용 추가 속성 |
| --- | --- | --- |
| page_view | 최초/실제 pathname 전환의 DOM 반영. query/hash 변경 제외 | page_path_template |
| company_list_view | 방문당 처음 표시된 정상 목록, 정상 0개 포함 | filter_region, filter_specialty, result_count |
| company_filter_applied | 사용자 조작으로 다른 값과 결과가 실제 표시됨 | changed_filter, filter_region, filter_specialty, result_count |
| company_card_click | 부모가 전달한 출처의 상세 링크 활성화 | company_id, source_surface, position |
| company_detail_view | 정상 업체 데이터가 표시됨. 오류/미존재 제외 | company_id, source_surface |
| contact_revealed | 방문·업체당 첫 숨김→펼침 반영 | company_id, cta_position |
| contact_button_clicked | 펼친 영역의 별도 연락 버튼 활성화. 완료 후 비활성 | company_id, cta_position=contact_panel |
| ai_recommend_requested | 유효 입력과 중복 차단을 통과한 실제 API 시작 | request_id |
| ai_recommend_result | 같은 요청의 결과/오류가 사용자에게 표시됨 | request_id, result_status, result_count 또는 error_type |

공통 속성은 `schema_version=1.0`, `environment`, `traffic_type`, `route_name`,
방문별 임의 `page_visit_id`다. 실제 화면 이동·뒤로/앞으로·새로고침은 새 방문이다.
StrictMode 재실행과 단순 재렌더는 중복하지 않는다. 데모 로그인은 분석 user_id가 아니다.

AI 결과는 success(1~3개), empty(0개), error다. 오류에는 result_count를 보내지 않고
503→unavailable, 502→upstream, 400→validation, 통신 오류→network, 그 외→other만
보낸다. 화면을 떠난 뒤 도착한 결과는 기록하지 않는다.

## 수집 경계

공통 함수가 이벤트별 허용 필드·타입을 검사한다. 이름, 전화번호, 이메일, 주소,
폼 값, AI 입력·추천 이유·오류 원문, 토큰, DOM 텍스트, 임의 URL query를 보내지 않는다.
지역·분야는 기존 옵션/all/other로 제한한다. 새 탭·직접 진입·불확실한 history 출처는
direct_or_unknown이다. Session Replay, Agent Analytics, 자동 수집, IP 수집,
원격 설정, 진단 수집은 사용하지 않는다. GPC/DNT 또는 탭의
`wegreen:analytics-disabled=true` 설정은 두 분석 경로를 중지한다.

SDK는 지연 로드하며 단일 `@amplitude/unified` 인스턴스를 사용한다.
설치된 1.1.38의 래퍼 특성상 `init(key, undefined, options)`로 호출해야 옵션이
올바르게 전달된다. `initAll`과 추가 플러그인은 호출하지 않는다.

## GTM/GA4 계약

GTM만 사용하며 직접 gtag 설치나 병렬 전송은 하지 않는다. 유효한
`VITE_GTM_CONTAINER_ID`가 없으면 컨테이너를 로드하지 않는다.

- `wegreen_page_view`: `wg_page_location`, `wg_page_title`, `wg_page_referrer`,
  `wg_environment`, `wg_traffic_type`, `wg_debug_mode`.
- `wegreen_contact_button_clicked`: 같은 페이지 문맥과 고정
  `wg_button_id=company_contact`, `wg_button_location=contact_panel`.
- 안전한 초기 페이지 문맥을 `gtm.js`와 함께 먼저 넣고 컨테이너를 로드한다.
  Google tag는 `send_page_view=false`와 위 안전 필드를 사용해야 한다.
  SPA 페이지 문맥 갱신 태그가 수동 page_view 태그보다 먼저 실행되어야 한다.
- 첫 진입에만 계획된 source/medium/campaign/content 조합을 보존한다.
  campaign은 wegreen_mission9_1이며 source는 kakaotalk, naver_cafe, instagram이다.
  상세 경로는 /companies/:id로 치환하고 그 밖의 query와 hash는 제거한다.
- 최초 referrer는 외부 origin만, SPA 전환 이후는 이전 정제 페이지 URL을 쓴다.
  GA4 enhanced measurement 및 자동 초기/history page view를 꺼 중복을 막는다.
  QA만 debug_mode=true이며 운영 태그는 디버그 전송을 제거해야 한다.

## 환경과 지표

키와 컨테이너는 VITE 환경 변수로 공급하고 로컬 값은 Git 제외 `.env.local`에 둔다.
`VITE_ANALYTICS_ENVIRONMENT`는 development/staging/production,
`VITE_ANALYTICS_TRAFFIC_TYPE`은 internal/qa/external이다. 운영 기본값은
production/external, 비운영 기본값은 development/internal이다. QA는 명시적으로
qa를 설정한다. 로그인이나 테스트 입력 내용으로 QA 여부를 추정하지 않는다.

핵심 문의 완료율은 production/external에서 고유 분석 사용자×company_id의
contact_revealed → contact_button_clicked를 같은 업체에 대해 순서대로 30분 내
수행한 비율이다. 전화번호 없는 정상 업체도 분모에 포함한다. 연락 버튼은
화면 내 시뮬레이션 완료이며 실제 전화/메시지 발신이나 실제 상담 완료를 뜻하지 않는다.

## 검증 상태 기록

자동 테스트는 SDK/HTTP를 모의 처리하고 실제 키로 전송하지 않는다. 로컬 API는
JSON seed 데이터만 사용하며 AI QA는 모의 응답으로 처리한다.
실제 수신 QA는 컨테이너 게시·검토 확인 후 별도 브라우저에서 수행한다.
Amplitude Network 성공, Live Feed/사용자 활동, GA4 DebugView와 최종 채널 보고서는
서로 다른 검증 단계다. 수신/홍보/성과가 미확인인 단계는 완료로 표시하지 않는다.


## Analytics deployment and anonymous identity safeguards

Vercel builds require VITE_AMPLITUDE_API_KEY and a valid VITE_GTM_CONTAINER_ID. Production requires VITE_ANALYTICS_ENVIRONMENT=production and VITE_ANALYTICS_TRAFFIC_TYPE=external. Preview requires staging and qa respectively. Missing or mismatched settings stop the build; errors contain variable names only. Local builds retain optional analytics.

The browser supplies an application-owned random anonymous device ID, validated and persisted separately from SDK identity storage. URL deviceId/ampDeviceId and existing SDK identities are ignored. If storage is unavailable, identity remains stable for the current page but cannot persist across refresh. It is never derived from login identity.
