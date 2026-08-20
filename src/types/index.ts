/** 조경업체 디렉토리 항목 */
export interface Company {
  id: string;
  name: string;
  location: string;
  region: string;
  category: string;
  specialties: string[];
  tagline: string;
  area: string;
  address: string;
  phone: string;
  career: string;
  caseCount: string;
  status: string;
  image: string;
  description: string;
  gallery: string[];
  services: string[];
  isUserRegistered?: boolean;
}

/** 목록 필터 상태 */
export interface CompanyFilters {
  region: string;
  specialty: string;
}

/** 로컬 스토리지 기반 로그인 사용자 */
export interface AuthUser {
  email: string;
  name: string;
  loggedInAt: string;
}

/** 로그인 폼 입력값 */
export interface LoginFormValues {
  email: string;
  password: string;
  name: string;
}

/** 업체 등록 폼 입력값 */
export interface RegisterFormValues {
  companyName: string;
  businessType: string;
  introduction: string;
  region: string;
  specialties: string[];
  career: string;
  managerName: string;
  email: string;
  agreement: boolean;
}

/** 폼 필드별 에러 메시지 */
export interface FormErrors {
  [field: string]: string;
}

/** FAQ 항목 */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
