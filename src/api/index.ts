const isDev = import.meta.env.DEV;
let bingWallpaperHost = 'https://www.bing.com';
let bingSuggestionHost = 'https://api.bing.com';
let baiduSuggestionHost = 'https://suggestion.baidu.com';
if (isDev) {
    bingWallpaperHost = '';
    bingSuggestionHost = '';
    baiduSuggestionHost = '';
}

export const getBingWallpaper = (page: number, pageSize: number = 8) => {
    const n = pageSize;
    const idx = page * n;
    return fetch(`${bingWallpaperHost}/HPImageArchive.aspx?format=js&idx=${idx}&n=${n}&mkt=zh-CN`,
        { credentials: 'omit' }
    ).then((res) => res.json());
}

export const getBingSuggestion = (keyword: string) => {
    return fetch(`${bingSuggestionHost}/qsonhs.aspx?q=${keyword}`,
        { credentials: 'omit' }
    ).then(async (res) => res.json());
}

export const getBaiduSuggestion = (keyword: string) => {
    return fetch(`${baiduSuggestionHost}/su?wd=${keyword}&action=opensearch&ie=utf-8&json=1&p=3`,
        { credentials: 'omit' }
    ).then(async (res) => res.json());
}
// return fetch(`/su?wd=${keyword}&cb&ie=utf-8&json=1`)
//     .then(async (res) => {
//          eval(await res.text());
//     });
// return fetch(`/su?wd=${keyword}&cb=return&ie=utf-8&json=1&p=3`)
//     .then(async (res) => {
//         return new Function(await res.text())();
//     });

// const fetchSuggest = (wd: InputEvent) => {
//     console.log((wd.target as HTMLInputElement).value);

//     const w = (wd.target as HTMLInputElement).value.trim();
//     if (!w) {
//         suggestions.value = [];
//         isOpenSuggestions.value = false;
//         return;
//     }

//     const cbName = `baidu_cb_${Date.now()}`;

//     (window as any)[cbName] = (res: any) => {
//         // res.s = [];
//         // res.AS.Results.forEach((item: any) => {
//         //   item.Suggests.forEach((suggest: any) => {
//         //     res.s.push(suggest.Txt);
//         //   });
//         // });

//         suggestions.value = res.s.slice(0, 6) || [];
//         console.log(suggestions.value);
//         isOpenSuggestions.value = true;

//         delete (window as any)[cbName];
//         script.remove();
//     };

//     const script = document.createElement('script');
//     script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(w)}&cb=${cbName}`;
//     //https://api.bing.com/qsonhs.aspx?q=
//     //https://suggest.bing.com/qsonhs.aspx?type=cb&q=
//     //https://sg1.api.bing.com/qsonhs.aspx?type=cb&cb=callback&q=
//     // script.src = `https://sg1.api.bing.com/qsonhs.aspx?type=cb&cb=${cbName}&q=${encodeURIComponent(w)}`;
//     // script.src = `https://api.bing.com/qsonhs.aspx?q=${encodeURIComponent(w)}`;
//     document.body.appendChild(script);
// };

// declare const chrome: any;

// export const getBingSuggestion = (keyword: string) => {
//     return new Promise((resolve, reject) => {
//         chrome.runtime.sendMessage(
//             { type: "bing", keyword },
//             (res : any) => {
//             }
//         );
//     });
// };
// export const getBaiduSuggestion = (keyword: string) => {
//     return new Promise((resolve, reject) => {
//         chrome.runtime.sendMessage(
//             { type: "baidu", keyword },
//             (res : any) => {
//             }
//         );
//     });
// };
