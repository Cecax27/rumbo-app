import LearningPathOverview from "@/components/learning/LearningPathOverview"
import { MOCK_PATH, MOCK_PROGRESS } from "./mock-data"

export default function LearningPage() {
  return <LearningPathOverview path={MOCK_PATH} progress={MOCK_PROGRESS} />
}
