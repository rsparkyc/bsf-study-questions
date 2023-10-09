export default interface AnswersResponse {
    data: Array<AnswersResponseDataElement>;
}

interface AnswersResponseDataElement {
    answerText: string;
    creationTime: string;
    personId: number;
    lessonDayQuestionId: number;
    lastModifiedTime: string;
}