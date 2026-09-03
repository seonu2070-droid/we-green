import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.ts";
import { SEED_COMPANIES } from "./data/seed-companies.ts";
import type { Company } from "./types.ts";

export class CompanyRepository {
  private readonly dataFile: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private initialization: Promise<void> | null = null;

  constructor(dataFile: string = config.dataFile) {
    this.dataFile = dataFile;
  }

  async findAll(): Promise<Company[]> {
    await this.ensureDataFile();
    return this.readCompanies();
  }

  async findById(id: string): Promise<Company | undefined> {
    const companies = await this.findAll();
    return companies.find((company) => company.id === id);
  }

  async create(company: Company): Promise<Company> {
    await this.enqueueWrite(async () => {
      await this.ensureDataFile();
      const companies = await this.readCompanies();
      await this.writeCompanies([company, ...companies]);
    });
    return company;
  }

  private async ensureDataFile(): Promise<void> {
    if (!this.initialization) {
      this.initialization = this.initializeDataFile();
    }

    try {
      await this.initialization;
    } catch (error) {
      this.initialization = null;
      throw error;
    }
  }

  private async initializeDataFile(): Promise<void> {
    try {
      await readFile(this.dataFile, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await mkdir(dirname(this.dataFile), { recursive: true });
      await this.writeCompanies(SEED_COMPANIES);
    }
  }

  private async readCompanies(): Promise<Company[]> {
    const raw = await readFile(this.dataFile, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Company data file must contain an array.");
    }
    return parsed as Company[];
  }

  private async writeCompanies(companies: Company[]): Promise<void> {
    const temporaryFile = `${this.dataFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(companies, null, 2), "utf8");
    await rename(temporaryFile, this.dataFile);
  }

  private enqueueWrite(operation: () => Promise<void>): Promise<void> {
    const nextWrite = this.writeQueue.then(operation, operation);
    this.writeQueue = nextWrite.catch(() => undefined);
    return nextWrite;
  }
}
