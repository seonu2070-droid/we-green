import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * 테스트마다 완전히 격리된 데이터 파일 경로를 만든다. 같은 경로를 여러
 * CompanyRepository 인스턴스가 공유하면 rename 기반 쓰기가 서로의 파일
 * 핸들과 충돌할 수 있어(특히 Windows에서 EPERM), 절대 경로를 공유하지 않는다.
 */
export function createTempDataFilePath(): string {
  return join(tmpdir(), `wegreen-test-${randomUUID()}.json`);
}

export async function removeDataFile(dataFile: string): Promise<void> {
  await rm(dataFile, { force: true });
  await rm(`${dataFile}.${process.pid}.tmp`, { force: true });
}
