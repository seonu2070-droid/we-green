import type { Company } from "../types";
import { normalizeFilterRegion } from "../utils/companyFilters";

export const REGION_OPTIONS = ["경기", "서울", "인천"] as const;

export const SPECIALTY_OPTIONS = [
  "주택 정원 조성",
  "식재 디자인",
  "데크·휴게 공간",
  "정원 유지관리",
  "상업 공간 조경",
] as const;

export const BUSINESS_TYPE_OPTIONS = [
  "개인사업자",
  "법인사업자",
  "프리랜서·예비사업자",
] as const;

export const REGISTER_REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충청",
  "기타 지역",
] as const;

const defaultGallery = [
  "/assets/images/company-1.webp",
  "/assets/images/company-2.webp",
  "/assets/images/garden-hero.webp",
];

/** 미션 5 Mock 데이터를 Company interface에 맞춰 정리 */
export const MOCK_COMPANIES: Company[] = [
  {
    id: "blue",
    name: "푸른정원 조경",
    location: "경기 포천",
    region: "경기",
    category: "주택 정원 조성",
    specialties: ["주택 정원 조성"],
    tagline: "가족의 일상과 계절의 변화를 함께 담는 주택 정원 전문",
    area: "경기 포천·양주·가평",
    address: "경기 포천시 신읍동",
    phone: "031-123-4567",
    career: "12년",
    caseCount: "대표 사례 28건",
    status: "상담 가능",
    image: "/assets/images/company-1.webp",
    description:
      "가족 구성원의 생활 동선과 반려동물의 안전, 계절에 따른 풍경의 변화를 함께 고려합니다. 자연스러운 디딤돌과 잔디, 수국 중심의 식재로 오래 머물고 싶은 주택 정원을 만듭니다.",
    services: ["주택 정원 조성", "식재 디자인", "정원 유지관리"],
    gallery: [
      "/assets/images/company-1.webp",
      "/assets/images/company-2.webp",
      "/assets/images/garden-hero.webp",
    ],
  },
  {
    id: "forest",
    name: "숲결 가든",
    location: "경기 남양주",
    region: "경기",
    category: "식재 디자인",
    specialties: ["식재 디자인"],
    tagline: "기존 수목과 지역 환경을 살린 자연주의 식재 디자인",
    area: "경기 남양주·구리·가평",
    address: "경기 남양주시 별내동",
    phone: "031-123-4567",
    career: "9년",
    caseCount: "대표 사례 21건",
    status: "상담 가능",
    image: "/assets/images/company-2.webp",
    description:
      "대지에 이미 자리 잡은 나무와 햇빛, 토양 조건을 먼저 읽습니다. 수목과 초화가 계절마다 다른 표정을 보여주도록 자연스러운 층을 만들고 지속 가능한 관리 방법을 함께 제안합니다.",
    services: ["식재 디자인", "주택 정원 조성", "정원 유지관리"],
    gallery: [
      "/assets/images/company-2.webp",
      "/assets/images/garden-hero.webp",
      "/assets/images/company-1.webp",
    ],
  },
  {
    id: "maru",
    name: "마루앤가든",
    location: "경기 광주",
    region: "경기",
    category: "데크·휴게 공간",
    specialties: ["데크·휴게 공간"],
    tagline: "정원과 실내를 자연스럽게 잇는 데크와 휴게 공간 전문",
    area: "경기 광주·성남·용인",
    address: "경기 광주시 오포동",
    phone: "031-123-4567",
    career: "11년",
    caseCount: "대표 사례 32건",
    status: "상담 가능",
    image: "/assets/images/company-3.webp",
    description:
      "실내의 편안함이 정원까지 이어지도록 생활 동선과 머무는 시간을 먼저 살핍니다. 목재 데크, 그늘 식재, 야외 휴게 공간을 하나의 장면처럼 연결합니다.",
    services: ["데크·휴게 공간", "주택 정원 조성", "식재 디자인"],
    gallery: [
      "/assets/images/company-3.webp",
      "/assets/images/company-2.webp",
      "/assets/images/garden-hero.webp",
    ],
  },
  {
    id: "objet",
    name: "오브제 가든",
    location: "서울·수도권",
    region: "서울",
    category: "주택 정원 조성",
    specialties: ["주택 정원 조성"],
    tagline: "도심의 작은 공간을 밀도 높은 녹색 휴식처로 바꾸는 디자인",
    area: "서울 전 지역·경기 서북부",
    address: "서울 강남구 세곡동",
    phone: "02-1234-5678",
    career: "7년",
    caseCount: "대표 사례 18건",
    status: "상담 가능",
    image: "/assets/images/garden-hero.webp",
    description:
      "테라스와 중정, 협소한 주택 외부 공간의 비례를 세심하게 조정합니다. 관리 부담은 낮추면서도 사계절의 인상이 살아 있는 도심형 정원을 제안합니다.",
    services: ["주택 정원 조성", "식재 디자인", "데크·휴게 공간"],
    gallery: [
      "/assets/images/garden-hero.webp",
      "/assets/images/company-3.webp",
      "/assets/images/company-2.webp",
    ],
  },
  {
    id: "care",
    name: "그린케어 랩",
    location: "인천·김포",
    region: "인천",
    category: "정원 유지관리",
    specialties: ["정원 유지관리"],
    tagline: "계절마다 건강한 정원을 위한 전문 유지관리 서비스",
    area: "인천 전 지역·경기 김포",
    address: "인천 서구 청라동",
    phone: "032-123-4567",
    career: "8년",
    caseCount: "관리 정원 46곳",
    status: "정기관리 가능",
    image: "/assets/images/company-1.webp",
    description:
      "정기 점검을 바탕으로 전정, 시비, 병충해 관리와 계절 식재를 진행합니다. 정원의 현재 상태와 관리 이력을 알기 쉽게 기록해 다음 계절을 준비합니다.",
    services: ["정원 유지관리", "식재 디자인"],
    gallery: [
      "/assets/images/company-1.webp",
      "/assets/images/garden-hero.webp",
      "/assets/images/company-2.webp",
    ],
  },
  {
    id: "season",
    name: "계절의 뜰",
    location: "경기 고양",
    region: "경기",
    category: "식재 디자인",
    specialties: ["식재 디자인"],
    tagline: "사계절의 색과 질감을 세심하게 설계하는 초화 식재 전문",
    area: "경기 고양·파주·서울 서북권",
    address: "경기 고양시 덕양구 행신동",
    phone: "031-123-4567",
    career: "10년",
    caseCount: "대표 사례 25건",
    status: "상담 가능",
    image: "/assets/images/company-2.webp",
    description:
      "개화 시기와 잎의 질감, 겨울철 구조미까지 고려한 초화 식재를 설계합니다. 한 시기만 화려한 정원이 아니라 계절의 흐름이 자연스럽게 이어지는 정원을 만듭니다.",
    services: ["식재 디자인", "주택 정원 조성", "정원 유지관리"],
    gallery: [
      "/assets/images/company-2.webp",
      "/assets/images/company-1.webp",
      "/assets/images/garden-hero.webp",
    ],
  },
];

export function createCompanyFromRegistration(input: {
  companyName: string;
  introduction: string;
  region: string;
  specialties: string[];
  career: string;
  email: string;
  managerName: string;
}): Company {
  const id = `user-${Date.now()}`;
  const primarySpecialty = input.specialties[0] ?? "주택 정원 조성";
  const careerLabel = input.career ? `${input.career}년` : "신규";

  return {
    id,
    name: input.companyName,
    location: input.region,
    region: normalizeFilterRegion(input.region),
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
    gallery: defaultGallery,
    isUserRegistered: true,
  };
}
