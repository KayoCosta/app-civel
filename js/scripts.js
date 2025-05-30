// Importando a biblioteca PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];

if (!pdfjsLib || !pdfjsLib.getDocument) {
    console.error("A biblioteca PDF.js não foi carregada corretamente.");
} else {
    const apiKey = 'AIzaSyCZOcYgSCAX0pTWBR1mJ8m-udAFAIyGyRA';
    const folderId = '1hagP5Eb8IzykGQVBB-zc8mKn8JIhm5TH';
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='application/pdf' and trashed=false&key=${apiKey}`;

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

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending, canvas, ctx);
                    pageNumPending = null;
                }
            }).catch(function(error) {
                console.error("Erro ao renderizar a página: ", error);
            });
        }).catch(function(error) {
            console.error("Erro ao carregar a página: ", error);
        });
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

            // Atualiza o QR Code com o PDF atual
            const qrImg =
::contentReference[oaicite:27]{index=27}
 
