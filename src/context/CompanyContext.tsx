import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Company, CompanyFilters, RegisterFormValues } from "../types";
import { createCompanyWithApi, getCompanies } from "../data/api";
import { filterCompaniesBy } from "../utils/companyFilters";

interface CompanyContextValue {
  companies: Company[];
  isLoading: boolean;
  isRegistering: boolean;
  error: string;
  reloadCompanies: () => Promise<void>;
  getCompanyById: (id: string) => Company | undefined;
  filterCompanies: (filters: CompanyFilters) => Company[];
  registerCompany: (values: RegisterFormValues) => Promise<Company>;
}

interface CompanyProviderProps {
  children: ReactNode;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const reloadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCompanies(await getCompanies());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "업체 정보를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadCompanies();
  }, [reloadCompanies]);

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
      const company = await createCompanyWithApi(values);
      setCompanies((current) => [company, ...current]);
      return company;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  const value = useMemo<CompanyContextValue>(
    () => ({
      companies,
      isLoading,
      isRegistering,
      error,
      reloadCompanies,
      getCompanyById,
      filterCompanies,
      registerCompany,
    }),
    [
      companies,
      isLoading,
      isRegistering,
      error,
      reloadCompanies,
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
