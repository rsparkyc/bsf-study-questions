// Loads lesson and scripture data per study via the v2 endpoints, caching
// each study's payload in IndexedDB keyed by the server's content version.

import AuthContext from "./AuthContext";
import { ScriptureData } from "./response/AllScripturesResponse";
import { Study } from "./response/AllLessonsResponse";
import { LessonIndexStudy, StudyLessonContent } from "./response/StudyV2Responses";
import {
    LessonIndexRequest,
    StudyLessonContentRequest,
    StudyScriptureRequest,
    StudyScriptureVersionRequest,
} from "./requests/StudyV2Requests";
import { cacheGet, cachePrune, cacheSet } from "./cache/idbCache";

export async function loadLessonIndex(auth: AuthContext): Promise<LessonIndexStudy[]> {
    return (await new LessonIndexRequest(auth).makeRequest()).data;
}

// Placeholder study built from the index, before its lesson content loads.
export function studyFromIndex(s: LessonIndexStudy): Study {
    return {
        studyId: s.studyId,
        code: s.code,
        displayName: s.displayName,
        numberLessons: s.lessons.length,
        seriesNumber: 0,
        releaseYear: s.releaseYear,
        isActive: s.isActive,
        lessons: [],
    };
}

function postProcessStudy(study: Study): Study {
    for (const lesson of study.lessons) {
        for (const lessonDay of lesson.lessonDays) {
            const t = lessonDay.lessonDayTranslations[0];
            const [mainTitle, subTitle] = t.title.split("\n");
            t.mainTitle = mainTitle;
            t.subTitle = subTitle;
        }
    }
    return study;
}

export async function loadStudyContent(
    auth: AuthContext,
    studyId: number,
    version: string
): Promise<Study> {
    const prefix = `content:${studyId}:`;
    const key = prefix + version;
    let content = await cacheGet<StudyLessonContent>(key);
    if (!content) {
        content = (await new StudyLessonContentRequest(auth, studyId).makeRequest()).data;
        cacheSet(key, content).then(() => cachePrune(prefix, key));
    }
    return postProcessStudy({
        studyId: content.studyId,
        code: content.code,
        displayName: content.displayName,
        numberLessons: content.numberLessons,
        seriesNumber: content.seriesNumber,
        releaseYear: content.releaseYear,
        isActive: content.isActive,
        lessons: content.lessons,
    });
}

export async function loadStudyScriptures(
    auth: AuthContext,
    studyId: number
): Promise<ScriptureData[]> {
    const versionResp = await new StudyScriptureVersionRequest(auth, studyId).makeRequest();
    const version = versionResp.data.find((v) => v.studyId === studyId)?.version ?? "none";
    const prefix = `scripture:${studyId}:`;
    const key = prefix + version;

    const cached = await cacheGet<ScriptureData[]>(key);
    if (cached) return cached;

    const resp = await new StudyScriptureRequest(auth, studyId).makeRequest();
    const scriptures: ScriptureData[] = resp.data.flatMap((group) =>
        group.scriptures.map((s) => ({
            scriptureId: s.scriptureId,
            languageId: 1,
            displayText: s.displayText,
            htmlContent: s.htmlContent,
            jsonContent: s.jsonContent,
            name: s.name,
            longName: s.longName,
            abbreviation: s.bookAbbreviation,
            chapterVerses: s.chapterVerses,
        }))
    );
    cacheSet(key, scriptures).then(() => cachePrune(prefix, key));
    return scriptures;
}
