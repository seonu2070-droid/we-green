import type { FormErrors, LoginFormValues, RegisterFormValues } from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string {
  if (!email.trim()) return "필수 항목을 입력해 주세요.";
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "올바른 이메일 형식으로 입력해 주세요.";
  }
  return "";
}

export function validateLoginForm(values: LoginFormValues): FormErrors {
  const errors: FormErrors = {};
  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email =
      emailError === "필수 항목을 입력해 주세요."
        ? "이메일을 입력해 주세요."
        : emailError;
  }

  if (!values.password.trim()) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (values.password.trim().length < 4) {
    errors.password = "비밀번호는 4자 이상 입력해 주세요.";
  }

  return errors;
}

export function validateRegisterForm(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.companyName.trim()) {
    errors.companyName = "필수 항목을 입력해 주세요.";
  }
  if (!values.businessType) {
    errors.businessType = "필수 항목을 입력해 주세요.";
  }
  if (!values.introduction.trim()) {
    errors.introduction = "필수 항목을 입력해 주세요.";
  } else if (values.introduction.trim().length < 20) {
    errors.introduction = "20자 이상 입력해 주세요.";
  }
  if (!values.region) {
    errors.region = "필수 항목을 입력해 주세요.";
  }
  if (values.specialties.length === 0) {
    errors.specialties = "전문 분야를 한 개 이상 선택해 주세요.";
  }
  if (!values.managerName.trim()) {
    errors.managerName = "필수 항목을 입력해 주세요.";
  }

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  if (!values.agreement) {
    errors.agreement = "약관에 동의해 주세요.";
  }

  return errors;
}

export function validateRecommendMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "찾으시는 내용을 입력해 주세요.";
  if (trimmed.length < 5) return "5자 이상 입력해 주세요.";
  if (trimmed.length > 300) return "300자 이하로 입력해 주세요.";
  return "";
}
