import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { FormErrors, LoginFormValues } from "../types";
import { validateLoginForm } from "../utils/validation";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHero } from "../components/layout/PageHero";
import { ApiError } from "../data/api";

interface LocationState {
  from?: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
  name: "",
};

export function LoginPage() {
  usePageTitle("로그인 | WE:GREEN");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? "/register";

  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields);
        setFormError(error.message);
      } else {
        setFormError("로그인에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content">
      <PageHero
        eyebrow="ACCOUNT"
        title="로그인"
        description="서버에서 계정 정보를 확인하고 발급한 JWT로 로그인 상태를 안전하게 이어갑니다."
      />

      <section className="register-section">
        <div className="container register-layout">
          <div className="register-guide">
            <p className="eyebrow">MVP AUTH</p>
            <h2>로그인 안내</h2>
            <p>
              업체 등록 등 보호된 기능을 사용하려면 먼저 로그인해 주세요.
              새로고침 후에도 로그인 상태가 유지됩니다.
            </p>
            <div className="register-note">
              <strong>체험용 계정</strong>
              <p>
                이메일: partner@wegreen.test / 비밀번호: green1234
              </p>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3>로그인 정보</h3>
              <div className="form-grid">
                <Input
                  className="field-full"
                  label="이름"
                  name="name"
                  value={values.name}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="표시할 이름 (선택)"
                />
                <Input
                  label="이메일"
                  name="email"
                  type="email"
                  requiredMark
                  autoComplete="email"
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
                <Input
                  label="비밀번호"
                  name="password"
                  type="password"
                  requiredMark
                  autoComplete="current-password"
                  value={values.password}
                  error={errors.password}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="4자 이상"
                />
              </div>
            </div>

            {formError ? (
              <p className="form-banner form-banner-error" role="alert">
                {formError}
              </p>
            ) : null}

            {isSubmitting ? (
              <LoadingState label="로그인 처리 중..." />
            ) : (
              <Button type="submit" wide>
                로그인하기
              </Button>
            )}

            <p className="form-footer-note">
              아직 계정이 없어도 됩니다.{" "}
              <Link to="/companies">업체 목록</Link>은 로그인 없이 볼 수
              있습니다.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
