import type { Company } from "../../types";

export const DEMO_USER = {
  email: "partner@wegreen.test",
  password: "green1234",
  name: "WE:GREEN 파트너",
};

export const FAKE_ACCESS_TOKEN = "test-access-token";

export const FIXTURE_COMPANIES: Company[] = [
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
    description: "가족 구성원의 생활 동선을 고려한 주택 정원 전문 업체입니다.",
    services: ["주택 정원 조성", "식재 디자인"],
    gallery: ["/assets/images/company-1.webp"],
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
    description: "정기 점검을 바탕으로 전정, 시비, 병충해 관리를 진행합니다.",
    services: ["정원 유지관리"],
    gallery: ["/assets/images/company-1.webp"],
  },
];
