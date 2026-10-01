import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAnalyticsVisit } from "../../analytics/AnalyticsProvider";
import { trackEvent, type PageVisit } from "../../analytics/tracking";
import { ApiError, getRecommendations } from "../../data/api";
import type { Recommendation } from "../../types";
import { validateRecommendMessage } from "../../utils/validation";
import { CompanyCard } from "../company/CompanyCard";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { LoadingState } from "../ui/LoadingState";
import { TextArea } from "../ui/TextArea";

export function AiRecommendSection() {
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<
    Recommendation[] | null
  >(null);
  const visit = useAnalyticsVisit();
  const lifecycle = useRef({ mounted: false, visitId: visit.id });
  const busy = useRef(false);
  const recordedResult = useRef<string | undefined>(undefined);
  const [settled, setSettled] = useState<{ visit: PageVisit; requestId: string; properties: Record<string, unknown> } | null>(null);
  useEffect(() => {
    lifecycle.current = { mounted: true, visitId: visit.id };
    return () => { lifecycle.current.mounted = false; };
  }, [visit.id]);
  useEffect(() => {
    if (!settled || isLoading || settled.visit.id !== visit.id || recordedResult.current === settled.requestId) return;
    recordedResult.current = settled.requestId;
    trackEvent("ai_recommend_result", settled.visit, { request_id: settled.requestId, ...settled.properties });
  }, [settled, isLoading, visit.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const validationError = validateRecommendMessage(message);
    setFieldError(validationError);
    setRequestError("");
    if (validationError) return;

    busy.current = true;
    const requestId = crypto.randomUUID();
    const requestVisit = visit;
    const stillVisible = () => lifecycle.current.mounted && lifecycle.current.visitId === requestVisit.id;
    setIsLoading(true);
    setSettled(null);
    setRecommendations(null);
    trackEvent("ai_recommend_requested", requestVisit, { request_id: requestId });
    try {
      const results = (await getRecommendations(message)).slice(0, 3);
      if (!stillVisible()) return;
      setRecommendations(results);
      setSettled({ visit: requestVisit, requestId, properties: {
        result_status: results.length ? "success" : "empty", result_count: results.length,
      } });
    } catch (caughtError) {
      if (!stillVisible()) return;
      setRequestError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      const status = caughtError instanceof ApiError ? caughtError.status : undefined;
      const errorType = status === 503 ? "unavailable" : status === 502 ? "upstream" : status === 400 ? "validation" : status === 0 ? "network" : "other";
      setSettled({ visit: requestVisit, requestId, properties: { result_status: "error", error_type: errorType } });
    } finally {
      busy.current = false;
      if (stillVisible()) setIsLoading(false);
    }
  };

  const statusMessage =
    isLoading || !recommendations
      ? ""
      : recommendations.length > 0
        ? `추천 업체 ${recommendations.length}곳을 찾았습니다.`
        : "조건에 맞는 업체를 찾지 못했습니다.";

  return (
    <section
      className="section ai-recommend-section"
      id="ai-recommend"
      aria-labelledby="ai-recommend-title"
    >
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">AI MATCHING</p>
          <h2 id="ai-recommend-title">어떤 정원을 원하시나요?</h2>
          <p>
            상황을 자유롭게 설명해 주시면 AI가 목록에 있는 업체 중 어울리는
            곳을 찾아드립니다.
          </p>
        </div>

        <form className="ai-recommend-form" onSubmit={handleSubmit} noValidate>
          <TextArea
            label="원하시는 정원이나 상황을 설명해 주세요"
            name="ai-recommend-message"
            rows={3}
            value={message}
            error={fieldError}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="예: 강아지와 함께 뛰어놀 수 있는 작은 마당을 서울에 만들고 싶어요"
          />

          {requestError ? (
            <p className="form-banner form-banner-error" role="alert">
              {requestError}
            </p>
          ) : null}

          <Button type="submit" wide aria-disabled={isLoading}>
            AI에게 추천받기
          </Button>

          {isLoading ? (
            <LoadingState label="어울리는 업체를 찾는 중..." />
          ) : null}
        </form>

        <div aria-busy={isLoading}>
          <p className="sr-only" role="status" aria-live="polite">
            {statusMessage}
          </p>

          {!isLoading && recommendations ? (
            recommendations.length > 0 ? (
              <div className="company-grid ai-recommend-results">
                {recommendations.map(({ company, reason }, index) => (
                  <div className="ai-recommend-result" key={company.id}>
                    <p className="ai-recommend-reason">{reason}</p>
                    <CompanyCard company={company} detailLabel="자세히 보기" sourceSurface="ai_recommend" position={index + 1} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="조건에 맞는 업체를 찾지 못했습니다."
                description="다른 표현으로 다시 설명해 보세요."
              />
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
