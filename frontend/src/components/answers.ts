import {UrlManager} from "../utils/url-manager";
import {Auth} from "../services/auth";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {QuizAnswerType, QuizQuestionType, QuizType} from "../types/quiz.type";
import {QueryParamsType} from "../types/query-params.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Answers {
    private quiz: QuizType | null;
    private routeParams: QueryParamsType;

    constructor() {
        this.quiz = null;
        this.routeParams = UrlManager.getQueryParams();

        this.init();
        this.showUserData();
        this.backToResult();
    }

    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }
        if (this.routeParams.id) {
            try {

                const result: PassTestResponseType = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' +
                    userInfo.userId);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.quiz = result as QuizType;
                    console.log(this.quiz.test)
                    this.showTestName();
                    this.showAnswers();
                    // return;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    showAnswers() {
        // формируем правильные и неправидльные варианты ответа
        if (this.quiz.test && this.quiz.test.questions.length > 0) {
            const questions = document.querySelector('.correct-answers');
            questions.innerHTML = '';

            let chosenAnswerIndex;
            let correctAnswerIndex;

            this.quiz.test.questions.forEach((questionItem:QuizQuestionType, questionIndex: number) => {
                const question: HTMLDivElement = document.createElement('div');
                question.className = 'correct-answers-options';

                const questionTitle: HTMLDivElement = document.createElement('div');
                questionTitle.className = 'correct-answer-title';
                questionTitle.innerHTML = `<span>Вопрос ${questionIndex + 1}:</span> ${questionItem.question}`;

                const questionOptions: HTMLDivElement = document.createElement('div');
                questionOptions.className = 'correct-answer-options';

                question.appendChild(questionTitle);
                question.appendChild(questionOptions);
                questions.appendChild(question);


                questionItem.answers.forEach((answerItem: QuizAnswerType, answerIndex) => {
                    const optionElement: HTMLDivElement = document.createElement('div');
                    optionElement.className = 'correct-answer-option';

                    if (answerItem.correct === true) {
                        optionElement.classList.add('checked-correct')
                    } else if (answerItem.correct === false) {
                        optionElement.classList.add('checked-wrong')
                    }

                    const answerElement: HTMLDivElement = document.createElement('div');
                    answerElement.className = 'option-answer';

                    optionElement.appendChild(answerElement);
                    optionElement.append(answerItem.answer);
                    questionOptions.appendChild(optionElement);
                });
            });
        }
    }

    // вывод инфы о пользователе, который прошел квест
    private showUserData(): void {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const userEmail: string | null = Auth.getUserEmail();

        document.querySelector('.answer-user-name').innerHTML = `<span>Тест выполнил</span> ${userInfo.fullName}, ${userEmail.email} `;
    }


    private showTestName(): void {
        document.getElementById('answer-pre-title').innerText = this.quiz.test.name;
    }


    backToResult() {
        const that: Answers = this;
        const backToResult: HTMLElement = document.getElementById('back');
        backToResult.addEventListener('click', () => {
            location.href = '#/result?id=' + that.routeParams.id;
        })
    }

}
