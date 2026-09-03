import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  BUSINESS_TYPE_OPTIONS,
  REGISTER_REGION_OPTIONS,
  SPECIALTY_OPTIONS,
} from "../data/companies";
import { useAuth } from "../context/AuthContext";
import { useCompanies } from "../context/CompanyContext";
import type { FormErrors, RegisterFormValues } from "../types";
import { validateRegisterForm } from "../utils/validation";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { TextArea } from "../components/ui/TextArea";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHero } from "../components/layout/PageHero";
import { ApiError } from "../data/api";

const initialValues: RegisterFormValues = {
  companyName: "",
  businessType: "",
  introduction: "",
  region: "",
  specialties: [],
  career: "",
  managerName: "",
  email: "",
  agreement: false,
};

export function RegisterPage() {
  usePageTitle("무료 업체 등록 | WE:GREEN");
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { registerCompany, isRegistering } = useCompanies();
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");

  if (isAuthLoading) {
    return (
      <main id="main-content">
        <section className="section">
          <div className="container">
            <LoadingState label="로그인 정보를 확인하는 중..." />
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/register" }} />;
  }

  const toggleSpecialty = (specialty: string) => {
    setValues((prev) => {
      const exists = prev.specialties.includes(specialty);
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter((item) => item !== specialty)
          : [...prev.specialties, specialty],
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const company = await registerCompany(values);
      navigate(`/register/complete/${company.id}`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields);
        setFormError(error.message);
      } else {
        setFormError("등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  return (
    <main id="main-content">
      <PageHero
        eyebrow="FOR LANDSCAPERS"
        title="무료 업체 등록"
        description="업체 정보를 등록하면 서버에 저장되어 어느 기기에서든 목록과 상세 화면에서 확인할 수 있습니다."
      />

      <section className="register-section" id="register-form">
        <div className="container register-layout">
          <div className="register-guide">
            <p className="eyebrow">PARTNER REGISTRATION</p>
            <h2>업체 등록 신청</h2>
            <p>
              기본 정보를 작성하면 등록 검토에 필요한 내용을 한 번에 확인할 수
              있습니다.
            </p>
            <ol>
              <li>
                <span>1</span>업체 기본 정보 입력
              </li>
              <li>
                <span>2</span>서비스 지역과 전문 분야 선택
              </li>
              <li>
                <span>3</span>담당자 정보 확인
              </li>
            </ol>
            <div className="register-note">
              <strong>저장 안내</strong>
              <p>제출한 업체 정보는 WE:GREEN 서버에 안전하게 저장됩니다.</p>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3>업체 기본 정보</h3>
              <div className="form-grid">
                <Input
                  label="업체명"
                  name="companyName"
                  requiredMark
                  value={values.companyName}
                  error={errors.companyName}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      companyName: event.target.value,
                    }))
                  }
                  placeholder="예: WE 조경"
                />
                <Select
                  label="사업자 구분"
                  name="businessType"
                  requiredMark
                  placeholder="선택해 주세요"
                  value={values.businessType}
                  error={errors.businessType}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      businessType: event.target.value,
                    }))
                  }
                  options={BUSINESS_TYPE_OPTIONS.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                />
                <TextArea
                  label="업체 소개"
                  name="introduction"
                  requiredMark
                  rows={4}
                  minLength={20}
                  value={values.introduction}
                  error={errors.introduction}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      introduction: event.target.value,
                    }))
                  }
                  placeholder="전문 분야와 업체의 강점을 20자 이상 작성해 주세요."
                />
              </div>
            </div>

            <div className="form-section">
              <h3>서비스 정보</h3>
              <div className="form-grid">
                <Select
                  label="주요 활동 지역"
                  name="region"
                  requiredMark
                  placeholder="선택해 주세요"
                  value={values.region}
                  error={errors.region}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      region: event.target.value,
                    }))
                  }
                  options={REGISTER_REGION_OPTIONS.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                />
                <fieldset
                  className="field specialty-field"
                  aria-invalid={Boolean(errors.specialties)}
                >
                  <legend>
                    주요 전문 분야 <b>*</b>
                  </legend>
                  <div className="specialty-options">
                    {SPECIALTY_OPTIONS.map((specialty) => (
                      <label className="tag-checkbox" key={specialty}>
                        <input
                          type="checkbox"
                          checked={values.specialties.includes(specialty)}
                          onChange={() => toggleSpecialty(specialty)}
                        />
                        <span>{specialty}</span>
                      </label>
                    ))}
                  </div>
                  <small className="field-error">
                    {errors.specialties ?? ""}
                  </small>
                </fieldset>
                <Input
                  label="업력"
                  name="career"
                  type="number"
                  min={0}
                  max={70}
                  value={values.career}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      career: event.target.value,
                    }))
                  }
                  placeholder="예: 8"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>담당자 정보</h3>
              <div className="form-grid">
                <Input
                  label="담당자 이름"
                  name="managerName"
                  requiredMark
                  value={values.managerName}
                  error={errors.managerName}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      managerName: event.target.value,
                    }))
                  }
                  placeholder="이름"
                />
                <Input
                  label="이메일"
                  name="email"
                  type="email"
                  requiredMark
                  value={values.email}
                  error={errors.email}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                />
                <label className="field field-full checkbox-field">
                  <input
                    type="checkbox"
                    name="agreement"
                    checked={values.agreement}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        agreement: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    업체 등록 검토를 위한 정보 확인 및 이용 안내에 동의합니다.{" "}
                    <b>*</b>
                  </span>
                  <small className="field-error">{errors.agreement ?? ""}</small>
                </label>
              </div>
            </div>

            {formError ? (
              <p className="form-banner form-banner-error" role="alert">
                {formError}
              </p>
            ) : null}

            {isRegistering ? (
              <LoadingState label="등록 정보를 저장하는 중..." />
            ) : (
              <Button type="submit" wide>
                등록 신청서 제출하기
              </Button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
