console.log("NPayAuto: 백그라운드 스크립트 시작됨");

browser.runtime.onInstalled.addListener(() => {
    console.log("NPayAuto: 애드온 설치됨");
});

browser.runtime.onMessage.addListener((message, _, sendResponse) => {
    console.log("NPayAuto: 백그라운드 메시지 수신:", message);

    switch (message.action) {
        case "openLink":
            openNaverPayLink(message.url);
            sendResponse({ success: true });
            return true;

        default:
            sendResponse({ success: false, error: "알 수 없는 액션" });
    }
});

async function openNaverPayLink(url) {
    try {
        await browser.tabs.create({ url: url, active: false });
        console.log("NPayAuto: 네이버페이 링크 열림:", url);
    } catch (error) {
        console.error("NPayAuto: 링크 열기 실패:", error);
    }
}
