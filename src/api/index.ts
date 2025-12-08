export const getBaiduSuggestion = (keyword: string) => {
    return fetch(`/su?wd=${keyword}`)
        .then((res) => res.json());
}

export const getBingWallpaper = (page: number, pageSize: number = 8) => {
    const n = pageSize;
    const idx = page * n;
    return fetch(`/HPImageArchive.aspx?format=js&idx=${idx}&n=${n}&mkt=zh-CN`)
        .then((res) => res.json());
}