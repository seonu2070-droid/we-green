import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "올바른 이메일 주소를 입력해 주세요." }),
  password: z
    .string({ error: "비밀번호를 입력해 주세요." })
    .min(4, "비밀번호는 4자 이상 입력해 주세요."),
  name: z.string().trim().max(40).optional().default(""),
});

export const registerCompanySchema = z.object({
  companyName: z
    .string({ error: "업체명을 입력해 주세요." })
    .trim()
    .min(1, "업체명을 입력해 주세요.")
    .max(80),
  businessType: z
    .string({ error: "사업자 구분을 선택해 주세요." })
    .trim()
    .min(1, "사업자 구분을 선택해 주세요."),
  introduction: z
    .string({ error: "업체 소개를 입력해 주세요." })
    .trim()
    .min(20, "업체 소개는 20자 이상 입력해 주세요.")
    .max(1000),
  region: z
    .string({ error: "활동 지역을 선택해 주세요." })
    .trim()
    .min(1, "활동 지역을 선택해 주세요."),
  specialties: z
    .array(z.string().trim().min(1), {
      error: "전문 분야를 한 개 이상 선택해 주세요.",
    })
    .min(1, "전문 분야를 한 개 이상 선택해 주세요.")
    .max(5),
  career: z
    .string({ error: "업력은 숫자로 입력해 주세요." })
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "업력은 숫자로 입력해 주세요.",
    ),
  managerName: z
    .string({ error: "담당자 이름을 입력해 주세요." })
    .trim()
    .min(1, "담당자 이름을 입력해 주세요.")
    .max(40),
  email: z.email({ error: "올바른 이메일 주소를 입력해 주세요." }),
  agreement: z.literal(true, {
    error: "정보 확인 및 이용 안내에 동의해 주세요.",
  }),
});

export function formatValidationErrors(error: z.ZodError) {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path.join(".") || "form", issue.message]),
  );
}
