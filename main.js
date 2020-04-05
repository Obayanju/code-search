const PORT = 3001;

document.addEventListener('DOMContentLoaded', (event) => {
    let processCodeBtn = document.querySelector("#process-code");
    processCodeBtn.onclick = () => {
        let codeAreaEl = document.querySelector("#code-area");
        let text = codeAreaEl.value;
        let req_body = {
            code: text
        }
        fetch(`http://localhost:${PORT}`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(req_body)
        }).then(function (response) {
            console.log(response);
        })
    }
});
