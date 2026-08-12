import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Company, CompanyFilters, RegisterFormValues } from "../types";
import { MOCK_COMPANIES, createCompanyFromRegistration } from "../data/companies";
import { appendUserCompany, loadUserCompanies } from "../data/storage";
import { filterCompaniesBy } from "../utils/companyFilters";

interface CompanyContextValue {
  companies: Company[];
  isRegistering: boolean;
  getCompanyById: (id: string) => Company | undefined;
  filterCompanies: (filters: CompanyFilters) => Company[];
  registerCompany: (values: RegisterFormValues) => Promise<Company>;
}

interface CompanyProviderProps {
  children: ReactNode;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [userCompanies, setUserCompanies] = useState<Company[]>(() =>
    loadUserCompanies(),
  );
  const [isRegistering, setIsRegistering] = useState(false);

  const companies = useMemo(
    () => [...userCompanies, ...MOCK_COMPANIES],
    [userCompanies],
  );

  const getCompanyById = useCallback(
    (id: string) => companies.find((company) => company.id === id),
    [companies],
  );

  const filterCompanies = useCallback(
    (filters: CompanyFilters) => filterCompaniesBy(companies, filters),
    [companies],
  );

  const registerCompany = useCallback(async (values: RegisterFormValues) => {
    setIsRegistering(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const company = createCompanyFromRegistration(values);
      const next = appendUserCompany(company);
      setUserCompanies(next);
      return company;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const value = useMemo<CompanyContextValue>(
    () => ({
      companies,
      isRegistering,
      getCompanyById,
      filterCompanies,
      registerCompany,
    }),
    [
      companies,
      isRegistering,
      getCompanyById,
      filterCompanies,
      registerCompany,
    ],
  );

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompanies(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanies must be used within CompanyProvider");
  }
  return context;
}
