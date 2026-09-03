import { randomUUID } from "node:crypto";
import type { Company } from "./types.ts";
import type { z } from "zod";
import type { registerCompanySchema } from "./schemas.ts";

type RegistrationInput = z.infer<typeof registerCompanySchema>;

export function createCompany(input: RegistrationInput): Company {
  const primarySpecialty = input.specialties[0] ?? "주택 정원 조성";
  const careerLabel = input.career ? `${input.career}년` : "신규";

  return {
    id: randomUUID(),
    name: input.companyName,
    location: input.region,
    region: input.region,
    category: primarySpecialty,
    specialties: input.specialties,
    tagline: input.introduction.slice(0, 60),
    area: input.region,
    address: `${input.region} (등록 신청)`,
    phone: "문의 시 안내",
    career: careerLabel,
    caseCount: "신규 등록",
    status: "검토 중",
    image: "/assets/images/garden-hero.webp",
    description: input.introduction,
    services: input.specialties,
    gallery: [
      "/assets/images/company-1.webp",
      "/assets/images/company-2.webp",
      "/assets/images/garden-hero.webp",
    ],
    isUserRegistered: true,
    createdAt: new Date().toISOString(),
  };
}
