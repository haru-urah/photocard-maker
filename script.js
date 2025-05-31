document.addEventListener('DOMContentLoaded', () => {
    const imageUploader = document.getElementById('imageUploader');
    const photocardCanvas = document.getElementById('photocardCanvas');
    const ctx = photocardCanvas.getContext('2d');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const stickerItems = document.querySelectorAll('.sticker-item');

    let backgroundImage = null; // 업로드된 배경 이미지
    let stickersOnCanvas = []; // 캔버스에 추가된 스티커들의 정보

    // --- 아이돌 포토카드 표준 크기 설정 (5.5cm x 8.5cm 비율) ---
    // 고화질 출력을 위해 충분히 큰 픽셀 값으로 설정합니다.
    const CARD_WIDTH_PX = 550; // 가로 5.5cm 에 상응하는 픽셀 (550px)
    const CARD_HEIGHT_PX = 850; // 세로 8.5cm 에 상응하는 픽셀 (850px)

    // 캔버스 초기화 및 크기 설정 함수
    function initializeCanvas() {
        photocardCanvas.width = CARD_WIDTH_PX;
        photocardCanvas.height = CARD_HEIGHT_PX;
        ctx.clearRect(0, 0, photocardCanvas.width, photocardCanvas.height); // 캔버스 지우기
        drawCanvasContent();
    }

    // 캔버스에 모든 내용(배경 이미지, 스티커)을 그리는 함수
    function drawCanvasContent() {
        ctx.clearRect(0, 0, photocardCanvas.width, photocardCanvas.height); // 전체 캔버스 지우기

        // 배경 이미지 그리기
        if (backgroundImage) {
            // 이미지를 캔버스에 'cover' 방식으로 그리기 (캔버스를 꽉 채우되 비율 유지, 이미지 일부 잘릴 수 있음)
            const imgWidth = backgroundImage.width;
            const imgHeight = backgroundImage.height;
            const canvasWidth = photocardCanvas.width;
            const canvasHeight = photocardCanvas.height;

            const imgAspectRatio = imgWidth / imgHeight;
            const canvasAspectRatio = canvasWidth / canvasHeight;

            let drawX = 0;
            let drawY = 0;
            let drawWidth = canvasWidth;
            let drawHeight = canvasHeight;

            if (imgAspectRatio > canvasAspectRatio) {
                // 이미지가 캔버스보다 가로가 긴 경우 (가로에 맞추고 세로 잘림)
                drawHeight = canvasWidth / imgAspectRatio;
                drawY = (canvasHeight - drawHeight) / 2; // 세로 중앙 정렬
                drawWidth = canvasWidth;
            } else {
                // 이미지가 캔버스보다 세로가 긴 경우 (세로에 맞추고 가로 잘림)
                drawWidth = canvasHeight * imgAspectRatio;
                drawX = (canvasWidth - drawWidth) / 2; // 가로 중앙 정렬
                drawHeight = canvasHeight;
            }
            ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);
        } else {
             // 배경 이미지가 없으면 캔버스 중앙에 메시지 표시
             ctx.fillStyle = '#f0f0f0'; // 배경색
             ctx.fillRect(0, 0, photocardCanvas.width, photocardCanvas.height);
             ctx.fillStyle = '#666'; // 텍스트 색상
             ctx.font = '28px Arial';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText('이미지를 업로드해주세요', photocardCanvas.width / 2, photocardCanvas.height / 2);
        }

        // 스티커 그리기
        stickersOnCanvas.forEach(sticker => {
            ctx.drawImage(sticker.img, sticker.x, sticker.y, sticker.width, sticker.height);
        });
    }

    // --- 이미지 업로드 기능 ---
    imageUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    backgroundImage = img;
                    stickersOnCanvas = []; // 새 이미지 업로드 시 스티커 초기화
                    drawCanvasContent(); // 변경된 배경 이미지로 캔버스 다시 그리기
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 스티커 추가 기능 ---
    stickerItems.forEach(stickerItem => {
        stickerItem.addEventListener('click', (event) => {
            const stickerSrc = event.target.src;
            const stickerImg = new Image();
            stickerImg.onload = () => {
                // 스티커의 기본 크기 (캔버스 너비의 1/4 정도로 설정)
                const stickerBaseWidth = CARD_WIDTH_PX / 4;
                const stickerWidth = stickerBaseWidth;
                const stickerHeight = (stickerImg.height / stickerImg.width) * stickerWidth; // 비율 유지

                // 초기 위치 (캔버스 중앙)
                const x = (photocardCanvas.width / 2) - (stickerWidth / 2);
                const y = (photocardCanvas.height / 2) - (stickerHeight / 2);

                stickersOnCanvas.push({
                    img: stickerImg,
                    x: x,
                    y: y,
                    width: stickerWidth,
                    height: stickerHeight
                });
                drawCanvasContent(); // 캔버스에 스티커 다시 그리기
            };
            stickerImg.src = stickerSrc;
        });
    });

    // --- 이미지 저장 기능 ---
    saveImageBtn.addEventListener('click', () => {
        if (!backgroundImage) {
            alert('먼저 배경 이미지를 업로드해주세요!');
            return;
        }

        alert('포토카드 저장을 시작합니다. 잠시 기다려주세요...'); // 사용자에게 저장 시작 알림

        // 캔버스 내용을 Blob 객체로 변환하여 다운로드 (가장 안정적인 방법)
        photocardCanvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-photocard.png'; // 저장될 파일 이름
                
                // 일부 브라우저에서 setTimeout이 도움이 될 수 있습니다.
                // 하지만 실제 사용자 클릭이 아니므로 여전히 막힐 수 있습니다.
                // setTimeout(() => {
                    document.body.appendChild(a); 
                    a.click(); 
                    document.body.removeChild(a); 
                    URL.revokeObjectURL(url); // 객체 URL 해제 (메모리 관리)
                // }, 0); // 0ms 지연으로 이벤트 루프 최하단으로

                //alert('포토카드가 성공적으로 저장되었습니다!'); // 다운로드 팝업 후 브라우저가 자동으로 처리
            } else {
                alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
            }
        }, 'image/png', 1.0); // PNG 형식, 최고 품질
    });

    // 초기 캔버스 설정
    initializeCanvas();
});