import { Lesson } from "./AllLessonsResponse";

interface Envelope<T> {
    isSuccess: boolean;
    errorMsg: string | null;
    errorCode: string | null;
    data: T;
}

export interface LessonIndexStudy {
    studyId: number;
    code: string;
    displayName: string;
    releaseYear: number;
    isActive: boolean;
    version: string;
    lessons: Array<{
        lessonNumber: number;
        scripture: string;
        title: string;
        numberOfQuestions: number;
    }>;
}
export type LessonIndexResponse = Envelope<LessonIndexStudy[]>;

export interface StudyLessonContent {
    studyId: number;
    version: string;
    code: string;
    displayName: string;
    numberLessons: number;
    seriesNumber: number;
    releaseYear: number;
    isActive: boolean;
    lessons: Lesson[];
}
export type StudyLessonContentResponse = Envelope<StudyLessonContent>;

export type StudyScriptureVersionResponse = Envelope<
    Array<{ studyId: number; version: string }>
>;

export interface StudyScriptureV2 {
    scriptureId: number;
    bookAbbreviation: string;
    chapterVerses: string;
    htmlContent: string;
    displayText: string | null;
    jsonContent: any | null;
    name: string;
    longName: string;
}
export type StudyScriptureResponse = Envelope<
    Array<{ studyId: number; version: string; scriptures: StudyScriptureV2[] }>
>;
