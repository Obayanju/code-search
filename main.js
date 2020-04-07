const PORT = 3000;

document.addEventListener('DOMContentLoaded', (event) => {
    let processCodeBtn = document.querySelector("#process-code");
    let outputEl = document.querySelector("#code-output>textarea");
    processCodeBtn.onclick = () => {
        let inputEl = document.querySelector("#code-area");
        let text = inputEl.value;
        let req_body = {
            code: text
        }
        fetch(`http://localhost:${PORT}`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(req_body),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data)
                for (const token of data) {
                    outputEl.innerHTML += token + '\n';
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }
});
