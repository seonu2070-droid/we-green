import { useState, type FormEvent } from "react";
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateRecommendMessage(message);
    setFieldError(validationError);
    setRequestError("");
    if (validationError) return;

    setIsLoading(true);
    setRecommendations(null);
    try {
      setRecommendations(await getRecommendations(message));
    } catch (caughtError) {
      setRequestError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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

          {isLoading ? (
            <LoadingState label="어울리는 업체를 찾는 중..." />
          ) : (
            <Button type="submit" wide>
              AI에게 추천받기
            </Button>
          )}
        </form>

        {!isLoading && recommendations ? (
          recommendations.length > 0 ? (
            <div className="company-grid ai-recommend-results">
              {recommendations.map(({ company, reason }) => (
                <div className="ai-recommend-result" key={company.id}>
                  <p className="ai-recommend-reason">{reason}</p>
                  <CompanyCard company={company} detailLabel="자세히 보기" />
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
    </section>
  );
}
