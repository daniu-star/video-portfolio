import WorkbenchClientPage from "./WorkbenchClientPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export const dynamicParams = true;

export default function WorkbenchPage() {
  return (
    <ErrorBoundary>
      <WorkbenchClientPage />
    </ErrorBoundary>
  );
}
