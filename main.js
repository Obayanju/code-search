require('dotenv').config()
const TOKEN = '4f3fc6b13c50d9cfbaa230dbe759525d1e130812';
let Buffer = require('buffer/').Buffer

const PORT = 3000;
const username = 'obayanju';
let owner = 'expressjs';
let repo = 'express';
let jsFiles = [];
let identTokens = [];

document.addEventListener('DOMContentLoaded', (event) => {
    let processCodeBtn = document.querySelector("#process-code");
    processCodeBtn.onclick = () => {
        processCode()
    }

    let parseUrlBtn = document.querySelector('#repo-input-btn');
    parseUrlBtn.onclick = () => {
        let urlTextEl = document.querySelector('#repo-input>textarea');
        parseGithubURL(urlTextEl.value);
    }

    let searchEl = document.querySelector("#search-text")
    let searchBtn = document.querySelector("#search")
    searchBtn.onclick = () => {
        if (searchEl.value != '') {
            let bound = search(searchEl.value)
            if (bound[0] != -1) {
                let outputEl = document.querySelector("#code-output>textarea");
                clear(outputEl)
                for (let i = bound[0]; i <= bound[1]; i++) {
                    outputEl.innerHTML += `${identTokens[i].LineNumber}: ${identTokens[i].FilePath}\n`
                }
            }
        }
    }
});

function processCode() {
    let outputEl = document.querySelector("#code-output>textarea");
    let inputEl = document.querySelector("#code-area");
    let text = inputEl.value;
    let req_body = {
        code: text,
    }
    fetch(`http://localhost:${PORT}`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        },
        body: JSON.stringify(req_body),
    })
        .then((response) => response.json())
        .then((data) => {
            clear(outputEl)
            for (const token of data) {
                outputEl.innerHTML += token + '\n';
            }
        })
        .catch((error) => {
            console.error('Error:', error)
        })

}



function clear(el) {
    el.innerHTML = ''
}

/**
 * Get all files in a directory
 */
async function getAllFiles(path) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        }
    });
    const result = await response.json();
    return result
}

function getJSRepos(filesArr) {
    filesArr.forEach(async content => {
        if (content.type == 'file' && isJSFile(content.name)) {
            await populateHTMLWithGithubURL(content)
            jsFiles.push({ path: content.path, html_url: content.html_url });
        }
        else if (content.type == 'dir') {
            let data = await getAllFiles(content.path)
            getJSRepos(data)
        }
    });
}

function isJSFile(fileName) {
    arr = fileName.split('');
    if (arr.length > 3 && arr.slice(-3).join('') == '.js') {
        return true;
    }
    return false;
}

async function loadCodeIntoDiv(item) {
    let inputEl = document.querySelector("#code-area");
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        }
    })
    const result = await response.json()
    inputEl.innerHTML = atob(result.content)
}

async function getContent(item) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`
    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        }
    })
    const result = await response.json()
    return result
}

async function sendCodeToInterpreter(code, filePath) {
    let req_body = {
        code: code,
        filePath: filePath
    }
    const url = `http://localhost:${PORT}/parse`
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            'Authorization': `Basic ${new Buffer(username + ':' + TOKEN).toString('base64')}`
        },
        body: JSON.stringify(req_body)
    })
    const result = await response.json();
    return result
}

function search(item) {
    let size = identTokens.length
    let start = -1, end = -1
    let i = 0;
    while (identTokens[i].Literal.toLowerCase() != item && i < size) {
        i++
    }
    start = i

    i = size - 1;
    while (identTokens[i].Literal.toLowerCase() != item && i > -1) {
        i--
    }
    end = i
    return [start, end]
    // console.log("find start")
    // while (l + 1 < r) {
    //     let mid = Math.floor(l + r / 2)
    //     console.log(identTokens[mid].Literal.toLowerCase(), item.toLowerCase())
    //     if (identTokens[mid].Literal.toLowerCase() >= item.toLowerCase()) {
    //         r = mid
    //     } else {
    //         l = mid
    //     }
    // }
    // if (identTokens[l].Literal.toLowerCase() == item) start = l
    // else if (identTokens[r].Literal.toLowerCase() == item) start = r
    // console.log("start found")

    // console.log("find end")
    // l = 0, r = size - 1
    // while (l + 1 < r) {
    //     let mid = Math.floor(l + r / 2)
    //     if (identTokens[mid].Literal.toLowerCase() <= item.toLowerCase()) {
    //         l = mid
    //     } else {
    //         r = mid
    //     }
    // }
    // if (identTokens[r].Literal.toLowerCase() == item) end = r
    // else if (identTokens[l].Literal.toLowerCase() == item) end = l
    // console.log("end found")
}

function compare(a, b) {
    if (a.Literal.toLowerCase() < b.Literal.toLowerCase()) {
        return -1
    } else if (a.Literal.toLowerCase() > b.Literal.toLowerCase()) {
        return 1
    }
    return 0
}

function populateHTMLWithGithubURL(item) {
    let filesEl = document.querySelector('#js-files-section');
    let a = document.createElement('a');
    a.href = item.html_url;
    a.innerHTML = item.path;
    a.onclick = function () { loadCodeIntoDiv(item); return false }
    parts = item.path.split('.')
    // ignore minified js
    if (parts[parts.length - 2] != 'min') {
        getContent(item).then(json => {
            sendCodeToInterpreter(atob(json.content), item.path).then(data => {
                data.forEach(item => {
                    identTokens.push(item)
                });
                identTokens.sort(compare)
                console.log(identTokens)
            })
        })
    }

    filesEl.appendChild(a);
    filesEl.appendChild(document.createElement('br'));
}

async function parseGithubURL(url) {
    let parts = url.split('/');
    owner = parts[parts.length - 2]
    repo = parts[parts.length - 1]

    await getAllFiles('').then(async result => {
        await getJSRepos(result);
    });
    console.log("done?", identTokens.length)
}
