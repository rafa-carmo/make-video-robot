const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    await fetchContentFromWikpedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikpedia(content) {
        const algorithmiaAuthenticate = algorithmia(algorithmiaApiKey)
        const wikpediaAlgorithm = algorithmiaAuthenticate.algo("web/WikipediaParser/0.1.2?timeout=300")
        const wikpediaResponse = await wikpediaAlgorithm.pipe(content.searchTerm)
        const wikpediaContent = wikpediaResponse.get()
        
        content.sourceContentOriginal = wikpediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)

        content.sourceContentOriginal = withoutDatesParentheses

        function removeBlankLinesAndMarkDown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkDown.join(' ')
        }   

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentOriginal)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                kewords: [],
                images: []
            })
            
        });
    }

    
    
}

module.exports = robot