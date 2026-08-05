/** Parseur unique des customId "academy:*" — un seul endroit à changer si le format évolue. */
export type AcademyAction =
  | { type: "list" }
  | { type: "start"; courseKey: string }
  | { type: "begin-quiz"; lessonId: string }
  | { type: "next-question"; lessonId: string; questionOrder: number; runningCorrect: number }
  | {
      type: "answer";
      lessonId: string;
      questionOrder: number;
      runningCorrect: number;
      choiceIndex: number;
    }
  | { type: "finish"; lessonId: string; score: number; totalQuestions: number }
  | { type: "restart"; lessonId: string };

export function parseAcademyCustomId(customId: string): AcademyAction | null {
  if (!customId.startsWith("academy:")) return null;
  const [, action, ...rest] = customId.split(":");

  switch (action) {
    case "list":
      return { type: "list" };
    case "start":
      return rest[0] ? { type: "start", courseKey: rest[0] } : null;
    case "begin-quiz":
      return rest[0] ? { type: "begin-quiz", lessonId: rest[0] } : null;
    case "next-question":
      return rest[0] && rest[1] !== undefined && rest[2] !== undefined
        ? {
            type: "next-question",
            lessonId: rest[0],
            questionOrder: Number(rest[1]),
            runningCorrect: Number(rest[2]),
          }
        : null;
    case "answer":
      return rest[0] && rest[1] !== undefined && rest[2] !== undefined && rest[3] !== undefined
        ? {
            type: "answer",
            lessonId: rest[0],
            questionOrder: Number(rest[1]),
            runningCorrect: Number(rest[2]),
            choiceIndex: Number(rest[3]),
          }
        : null;
    case "finish":
      return rest[0] && rest[1] !== undefined && rest[2] !== undefined
        ? { type: "finish", lessonId: rest[0], score: Number(rest[1]), totalQuestions: Number(rest[2]) }
        : null;
    case "restart":
      return rest[0] ? { type: "restart", lessonId: rest[0] } : null;
    default:
      return null;
  }
}
