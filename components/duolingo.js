import config from '../config.js';
import axios from 'axios';

class Duolingo {
    /** Represents a Duolingo instance
     * @constructor
     * @param {Object} opts
     * @param {String} opts.userName
     * @param {String} opts.password
     */
    constructor(opts) {
        this.userName = opts.userName;
        this.password = opts.password;
        this.jwt = null;
        this.userData = null;
        /** Should be node or browser**/
        this.environment = typeof window === 'undefined' ? 'node' : 'browser';
    }

    /**
     * Login with Duo credentials
     * @returns {Promise<*>}
     */
    async logIn () {
        const URL = `${config.duoHost}/login`;
        try{
            const result = await this.apiRequest('POST', URL, {login: this.userName, password: this.password});
            this.jwt = result.headers.jwt;
            return result.data;
        }catch(e){
            return e;
        }
    }

    /**
     * Request Method to API Services
     * @param {String} method
     * @param {String} url      Must pass full url example `https://www.duolingo.com/user/userName`
     * @param {Object} data
     * @returns {AxiosPromise}
     */
    apiRequest (method, url, data, cb){
        let headers = {
            "User-Agent": 'Mozilla/5.0',
            "Authorization": null
        };
        if(this.jwt){
            headers['Authorization'] = 'Bearer ' + this.jwt;
        }
        data = JSON.stringify(data);
        if(method === 'POST'){
            headers['Content-Type'] = 'application/json';
        }
        let options = {
            url,
            method,
            headers,
            data
        };
        return axios(options);
    }

    /**
     * Get User Data from https://www.duolingo.com/user/<userName>
     * @returns {Promise<userData>}
     */
    async getData () {
        const URL = `${config.duoHost}/users/${this.userName}`;
        try{
            let result = await this.apiRequest('GET', URL);
            this.userData = result.data;
            return this.userData;
        }catch(e){
            throw Error(e)
        }
    }

    /**
     * Get overview of users vocabulary for given language
     * @returns {Promise<*>}
     */
    async getVocabulary() {
        const URL = `${config.duoHost}/vocabulary/overview`;
        try{
            let result = await this.apiRequest('GET', URL)
            return result.data;
        }catch(e){
            throw Error(e)
        }
    }

    /**
     * Gets all languages a user is learning
     * @param {Boolean} abbreviations      If true, return abbreviations, eg: 'es' instead of 'Spanish'
     * @returns {Array}
     */
    getLanguages(abbreviations = false){
        let data = []
        this.userData.languages.forEach(lang => {
            if(lang['learning']){
                if(abbreviations){
                    data.push(lang['language']);
                }else{
                    data.push(lang['language_string']);
                }
            }
        });
        return data;
    }

    /**
     * Switch users language using language abbreviation eg: 'es' or 'fr'
     * One should call getData again to update userData after switching languages
     * @param {String} lang
     */
    async switchLanguage(lang){
        const URL = `${config.duoHost}/switch_language`
        const data = {"learning_language": lang};
        try{
            let result = await this.apiRequest('POST', URL, data);
            return result.data;
        }catch(e){
            throw Error(e)
        }
    }


    /**
     * Get words' translations from
     * https://d2.duolingo.com/api/1/dictionary/hints/<source>/<target>?tokens=``<words>``
     * @param {Array} words
     * @param {String} source
     * @param {String} target
     */
    async getTranslations (words, source, target) {
        if(!source) source = this.userData.ui_language;
        if(!target) target = Object.keys(this.userData.language_data)[0]
        const encodedWords = encodeURIComponent(JSON.stringify(words));
        const URL = `https://d2.duolingo.com/api/1/dictionary/hints/${source}/${target}?tokens=${encodedWords}`
        try{
            const result = await this.apiRequest('GET', URL);
            return result.data;
        }catch(e){
            throw Error(e)
        }
    }

    /**
     * Get user specific information from user data object
     * @returns {*[]}
     */
    getUserData() {
        const fields = ['username', 'bio', 'id', 'num_following', 'cohort',
            'language_data', 'num_followers', 'learning_language_string',
            'created', 'contribution_points', 'gplus_id', 'twitter_id',
            'admin', 'invites_left', 'location', 'fullname', 'avatar',
            'ui_language'];

        const obj = fields.map(field => {
           return this.userData[field];
        });
        return obj;
    }

    /**
     * Returns all learned skills sorted by most recently learned
     * @param {String} lang
     */
    getLearnedSkills (lang) {
        const ordered = this.userData['language_data'][lang].skills.sort((a, b) => {
            if(a.learned && b.learned){
               return b['learned_ts'] - a['learned_ts']
            };
            if(a.learned > b.learned) return -1;
        }).filter(skill => {
            if(skill.learned){
                return skill;
            }
        });
        return ordered;
    }

    /**
     * Get list of words learned by the user
     * @param {String} lang
     */
    getLearnedWords(lang){
        let words = [];
        this.userData.language_data[lang].skills.forEach(topic => {
            if(topic.learned){
                words = words.concat(topic['words']);
            }
        });
        return words;
    }

    /**
     * Get known topics from a user
     * @param {String} lang
     */
    getKnownTopics(lang){
        let topics = [];
        this.userData.language_data[lang].skills.forEach(topic => {
            if(topic.learned){
                topics.push(topic.title);
            }
        });
        return topics;
    }

    /**
     * Get related words from given word
     * @param {String} word
     * @param {Boolean} languageAbbr
     */
    async getRelatedWords(word){
        let relatedWords = [];
        try{
            let result = await this.getVocabulary();
            let overview = result['vocab_overview'];
            overview.forEach(wordData => {
                if(wordData.normalized_string === word.toLowerCase()){
                    let relatedLexemes = wordData.related_lexemes;
                    overview.forEach(wd => {
                        if(relatedLexemes.indexOf(wd.lexeme_id) !== -1){
                            relatedWords.push(wd);
                        }
                    });
                }
            });
            return relatedWords;
        }catch(e){
            throw Error(e);
        }
    }

    /**
     * Return all skills of a users language
     * @param lang
     */
    getSkills(lang){
        return this.userData['language_data'][lang].skills;
    }

    /**
     * Get array of keys from user data object
     * @returns {string[]}
     */
    getUserDataKeys () {
        return Object.keys(this.userData);
    }

    isCurrentLanguage (abbr) {
        return abbr in this.userData.language_data;
    }
}

export default Duolingo;
