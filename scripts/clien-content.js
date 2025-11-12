// 네이버페이 포인트 링크 패턴
const NAVERPAY_PATTERNS = [/campaign2\.naver\.com\/npay/, /ofw\.adison\.co\/u\/naverpay/];

// 처리된 링크 추적
let processedLinks = new Set();

// 링크가 네이버페이 포인트 링크인지 확인
function isNaverPayLink(url) {
    return NAVERPAY_PATTERNS.some((pattern) => pattern.test(url));
}

// 페이지의 모든 네이버페이 포인트 링크 찾기
function findNaverPayLinks() {
    const links = document.querySelectorAll("a[href]");
    const naverpayLinks = [];

    links.forEach((link) => {
        const href = link.href;
        if (href && isNaverPayLink(href) && !processedLinks.has(href)) {
            naverpayLinks.push({
                url: href,
                text: link.textContent.trim(),
                element: link,
            });
            processedLinks.add(href);
        }
    });

    return naverpayLinks;
}

// 링크를 Background Script로 전송
function sendLinksToBackground(links) {
    if (links.length === 0) return;

    console.log(`NPayAuto: 링크 ${links.length}개 발견:`, links);

    try {
        browser.runtime.sendMessage(
            {
                action: "foundNaverPayLinks",
                links: links.map((link) => ({
                    url: link.url,
                    text: link.text,
                })),
            },
            (response) => {
                if (browser.runtime.lastError) {
                    console.error("NPayAuto: 백그라운드 스크립트로 링크 전송 실패:", browser.runtime.lastError);
                    return;
                }

                if (response && response.success) {
                    console.log("NPayAuto: 백그라운드 스크립트로 링크 전송됨");
                } else {
                    console.error("NPayAuto: 백그라운드 스크립트로 링크 전송 실패:", response ? response.error : "응답 없음");
                }
            }
        );
    } catch (error) {
        console.error("메시지 전송 중 오류:", error);
    }
}

// 메인 처리 함수
function main() {
    console.log("NPayAuto: 클리앙 페이지 초기화 시작");

    // 링크 찾기
    setTimeout(() => {
        const links = findNaverPayLinks();

        if (links.length === 0) {
            console.log("NPayAuto: 감지된 링크 없음");
            return;
        }

        console.log(`NPayAuto: 링크 ${links.length}개 발견`);
        sendLinksToBackground(links);
    }, 2000);
}

// 페이지 로딩 완료 시 실행
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

// 페이지 변경 감지
function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        mutations.forEach((mutation) => {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                shouldCheck = true;
            }
        });

        if (shouldCheck) {
            setTimeout(() => {
                const newLinks = findNaverPayLinks();
                if (newLinks.length > 0) {
                    console.log(`NPayAuto: 링크 ${newLinks.length}개 발견`);
                    sendLinksToBackground(newLinks);
                }
            }, 1000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// 페이지 변경 감지 시작
observePageChanges();
