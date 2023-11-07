interface Translation {
    name: string;
    languageId: number;
    description: string | null;
}

interface Material {
    materialId: number;
    materialLanguageId: number;
    materialTranslationLanguageId: number;
    author: string;
    code: string | null;
    fileLocationUrl: string;
    fileLocationUrlWithSas: string | null;
    lessonId: number;
    lessonNumber: number;
    materialCategoryId: number;
    materialCategoryTranslationLanguageId: number;
    materialCategoryTranslationName: string | null;
    materialFileTypeId: number;
    materialFileTypeTranslationName: string | null;
    materialLessonId: number;
    translations: Translation[];
    materialTypeId: number;
    materialTypeTranslationLanguageId: number;
    materialTypeTranslationName: string | null;
    releaseDate: string;
    creationTime: string;
    scripture: string | null;
    studyId: number;
    tags: string | null;
    title: string | null;
    versionNumber: string;
}

interface MaterialUrl {
    url: string;
}
