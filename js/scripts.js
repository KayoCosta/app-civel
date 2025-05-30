const pdfjsLib = window['pdfjs-dist/build/pdf'];

if (!pdfjsLib || !pdfjsLib.getDocument) {
    console.error("A biblioteca PDF.js não foi carregada corretamente.");
} else {
    const apiKey = 'AIzaSyCZOcYgSCAX0pTWBR1mJ8m-udAFAIyGyRA';
    const folderId = '1hagP5Eb8IzykGQVBB-zc8mKn8JIhm5TH';

    const encodedQuery = encodeURIComponent(`'${folderId}' in parents and mimeType='application/pdf' and trashed=false`);
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=files(id,name)&key=${apiKey}`;

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    const scale = 1.16;
    const canvas1 = document.getElementById('pdf-render1');
    const canvas2 = document.getElementById('pdf-render2');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    let pdfList = [];
    let currentPdfIndex = 0;

    function renderPage(num, canvas, ctx) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext: ctx, viewport: viewport };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending, canvas, ctx);
                    pageNumPending = null;
                }
            }).catch(error => console.error("Erro ao renderizar a página:", error));
        }).catch(error => console.error("Erro ao carregar a página:", error));
    }

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            if (num <= pdfDoc.numPages) {
                renderPage(num, canvas1, ctx1);
                if (num + 1 <= pdfDoc.numPages) {
                    renderPage(num + 1, canvas2, ctx2);
                } else {
                    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                }
            }

            let pageText = ` ${num}`;
            if (num + 1 <= pdfDoc.numPages) {
                pageText += ` e ${num + 1}`;
            }
            document.getElementById('page-num').textContent = pageText;
        }
    }

    function nextPage() {
        if (pageNum + 2 <= pdfDoc.numPages) {
            pageNum += 2;
        } else {
            pageNum = 1;
        }
        queueRenderPage(pageNum);
    }

    function loadPdfFromDrive(pdfUrl) {
        pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            pageNum = 1;
            document.getElementById('page-count').textContent = pdfDoc.numPages;
            queueRenderPage(pageNum);

            if (pdfDoc.numPages > 1) {
                setInterval(nextPage, 10000);
            }

            const qrImg = document.getElementById("qr-code-img");
            if (qrImg) {
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pdfUrl)}`;
            }
        }).catch(error => {
            console.error("Erro ao carregar o PDF:", error);
        });
    }

    fetch(driveApiUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.files || data.files.length === 0) {
                console.error("Nenhum PDF encontrado na pasta ou falta de permissão.");
                return;
            }

            pdfList = data.files.map(file => `https://drive.google.com/uc?export=download&id=${file.id}`);
            loadPdfFromDrive(pdfList[currentPdfIndex]);

            if (pdfList.length > 1) {
                setInterval(() => {
                    currentPdfIndex = (currentPdfIndex + 1) % pdfList.length;
                    loadPdfFromDrive(pdfList[currentPdfIndex]);
                }, 30000);
            }
        })
        .catch(error => {
            console.error("Erro ao buscar arquivos do Google Drive:", error);
        });

    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    setInterval(updateTime, 1200);
    updateTime();
}
