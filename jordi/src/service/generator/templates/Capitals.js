const WikidataQAFetcher = require('../WikidataQAFetcher');

const sparqlquery = `
SELECT DISTINCT ?countryLabel ?capitalLabel WHERE {
    ?country wdt:P31 wd:Q6256;
        wdt:P36 ?capital;
        wdt:P1082 ?population;
        rdfs:label ?countryLabel.
    ?capital rdfs:label ?capitalLabel.
    FILTER(LANG(?countryLabel) = "en")
    FILTER(LANG(?capitalLabel) = "en")
    FILTER(?population > 30000000)
}
`

function getStatement(country) {
    const statements = [
        `The capital of ${country} is...`,
        `What is the capital of ${country}?`,
        `Select the capital of ${country}`
    ]

    return statements[Math.floor(Math.random() * statements.length)];
}

function pushQuestion(Question, questions, data, x) {
    const country = data.results.bindings[x].countryLabel.value;
    const capital = data.results.bindings[x].capitalLabel.value;
    questions.push(new Question({
        category: "Country",
        statement: getStatement(country),
        options: [capital]
    }));
}

capitals = new WikidataQAFetcher(
    sparqlquery,
    pushQuestion,
);

module.exports = capitals;