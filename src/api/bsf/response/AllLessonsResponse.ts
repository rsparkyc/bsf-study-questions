export default interface AllLessonsResponse {
    isSuccess: boolean;
    errorMsg: string | null;
    data: AllLessonsResponseData;
    errorCode: string | null;
    version: number;
}

interface AllLessonsResponseData {
    studies: Array<Study>;
    signature: string;
}

interface LessonDayQuestionTranslation {
    languageId: number;
    questionText: string;
}

interface LessonDayQuestionScripture {
    scriptureId: number;
    displayOrder: number;
    scripture: {
        ScriptureId: number;
        bookAbbreviation: string;
        chapter: number;
        verses: string;
        chapterVerses: string;
        scriptureTranslations: Array<{
            languageId: number;
            displayText: null | string;
        }>;
        isActive: boolean;
    };
}

export interface LessonDayQuestion {
    lessonDayQuestionId: number;
    questionNumber: number;
    questionSubNumber: null | string;
    isAnswerRequired: boolean;
    lessonDayQuestionScriptures: LessonDayQuestionScripture[];
    lessonDayQuestionTranslations: LessonDayQuestionTranslation[];
}

interface LessonDayTranslation {
    languageId: number;
    title: string;
}

export interface LessonDay {
    lessonDayId: number;
    lessonId: number;
    dayOfWeek: number;
    lessonDayTranslations: Array<LessonDayTranslation>;
    lessonDayQuestions: Array<LessonDayQuestion>;
    lessonDayScriptures: Array<LessonDayQuestionScripture>;
}

interface LessonTranslation {
    languageId: number;
    scripture: string;
    title: string;
    focusVerse: null | string;
}

export interface Lesson {
    lessonId: number;
    lessonNumber: number;
    scripture: string;
    title: string;
    isActive: boolean;
    lessonScriptures: any[]; // Not sure what type this is
    lessonTranslations: Array<LessonTranslation>;
    lessonDays: Array<LessonDay>;
}

export interface Study {
    studyId: number;
    code: string;
    displayName: string;
    numberLessons: number;
    seriesNumber: number;
    releaseYear: number;
    lessons: Array<Lesson>;
    isActive: boolean;
}
