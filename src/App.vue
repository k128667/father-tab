<template>
  <main class="tab-main">
    <section class="container">
      <section ref="timeBoxRef" class="time-box">
        <time class="time">{{ time }}</time>
        <div class="date">
          <time class="date-text">{{ date }}</time>
          <span class="week">{{ week }}</span>
        </div>
      </section>

      <div ref="searchBoxRef" class="search-box">
        <button ref="searchEngineRef" class="select-engine">
          <img class="engine-icon" :src="searchEngines[currentEngine].icon" alt="engineIcon">
          <img class="down-icon" :src="downSvg" alt="downIcon">
        </button>

        <form @submit.prevent="handleSearch">
          <input type="search" name="search" placeholder="请输入搜索内容" v-model="keyword" @input="getSuggestion">
          <button type="submit" class="search-button">
            <img class="search-icon" :src="searchIcon" alt="searchIcon">
          </button>
        </form>

        <ul v-show="isOpenEngineOptions" ref="engineOptionsRef" class="engine-options" role="listbox">
          <li role="option" v-for="(engine, key) in searchEngines" :key="key" @click="selectEngine(key)">
            <img class="engine-icon" :src="engine.icon" alt="">
            <p class="engine-name">{{ engine.name }}</p>
          </li>
          <li class="add-engine" role="option" @click="addEngine()">
            <img class="engine-icon" :src="addIcon" alt="addIcon">
            <p class="engine-name">添加</p>
          </li>
        </ul>

        <!-- 搜索建议 -->
        <ul v-show="isOpenSuggestions" ref="suggestionsRef" class="suggestions" role="listbox">
          <li role="option" v-for="(suggestion, index) in suggestions" :key="suggestion"
            @click="handleSuggestionClick(index)">
            <p>{{ suggestion }}</p>
          </li>
        </ul>

      </div>
    </section>

    <nav class="options-box" aria-label="功能选项">
      <button class="option-item" aria-label="设置">
        <img class="setting-icon" :src="settingIcon" alt="">
      </button>
      <!-- <button class="option-item" aria-label="主题">
        <img class="theme-icon" :src="themeIcon" alt="">
      </button>

      <button class="option-item" aria-label="登录">
        <img class="user-icon" :src="userIcon" alt="">
      </button> -->
    </nav>

    <dialog ref="bingWallpaperRef" class="modal">
      壁纸
    </dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { getBingWallpaper, getBingSuggestion, getBaiduSuggestion } from '@/api';
import searchIcon from '@/assets/search.svg';
import downSvg from '@/assets/down.svg';
import settingIcon from '@/assets/setting.svg';
import bingIcon from '@/assets/bing.svg';
import baiduIcon from '@/assets/baidu.svg';
import googleIcon from '@/assets/google.svg';
import addIcon from '@/assets/add.svg';

const weekStyle = {
  weekFull: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekEn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

const searchEngines = {
  bing: {
    name: '必应',
    url: 'https://www.bing.com/search',
    queryParam: 'q',
    icon: bingIcon,
  },
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s',
    queryParam: 'wd',
    icon: baiduIcon,
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com/search',
    queryParam: 'q',
    icon: googleIcon,
  },
};

const timeBoxRef = ref<HTMLDivElement>();
const searchBoxRef = ref<HTMLLabelElement>();
const searchEngineRef = ref<HTMLDivElement>();
const engineOptionsRef = ref<HTMLUListElement>();
const bingWallpaperRef = ref<HTMLDialogElement>();

const bingUrlPrefix = 'https://www.bing.com';
const bingUrlSuffix = ref('');
const bingUrl = computed(() => {
  return `url(${bingUrlPrefix + bingUrlSuffix.value})`;
});

const now = ref(new Date());
const time = ref('');
const date = ref('');
const week = ref('');

const keyword = ref('');

const bingWallpaperPage = ref(0);

const currentEngine = ref<keyof typeof searchEngines>('bing');
const currentWeekStyle = ref<keyof typeof weekStyle>('weekFull');
const currentSuggestion = ref<'bing' | 'baidu'>('bing');

const suggestions = ref<string[]>([]);

const isOpenEngineOptions = ref(false);
const isOpenSuggestions = ref(false);

let hour12 = false;
let timer: number;
let resizeObserver: ResizeObserver;

const userSetting = reactive({
  openInNewTab: false,
});

const updateTime = () => {
  now.value = new Date();
  time.value = now.value.toLocaleTimeString('zh-CN', { hour12 });
  date.value = now.value.toLocaleDateString('zh-CN');
  week.value = weekStyle[currentWeekStyle.value][now.value.getDay()];
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (searchEngineRef.value!.isEqualNode(target) ||
    searchEngineRef.value!.contains(target)) {
    isOpenEngineOptions.value = !isOpenEngineOptions.value;
  } else if (engineOptionsRef.value &&
    !engineOptionsRef.value.isEqualNode(target) &&
    !engineOptionsRef.value.contains(target)) {
    isOpenEngineOptions.value = false;
  }
};

const handleSearch = () => {
  if (!keyword.value) return;
  const engine = searchEngines[currentEngine.value];
  const searchUrl = `${engine.url}?${engine.queryParam}=${encodeURIComponent(keyword.value)}`;
  const openTarget = userSetting.openInNewTab ? '_blank' : '_self';
  window.open(searchUrl, openTarget);
};

const selectEngine = (key: keyof typeof searchEngines) => {
  currentEngine.value = key;
  isOpenEngineOptions.value = false;
};

const addEngine = () => {

};

const getSuggestion = () => {
  if (!keyword.value) {
    isOpenSuggestions.value = false;
    suggestions.value = [];
    return;
  };
  switch (currentSuggestion.value) {
    case 'bing':
      getBingSuggestion(keyword.value).then((res: any) => {
        const bingSuggestions: string[] = [];
        res.AS.Results?.forEach((item: any) => {
          item.Suggests.forEach((suggest: any) => {
            bingSuggestions.push(suggest.Txt as string);
          });
        });
        suggestions.value = bingSuggestions;
      });
      break;
    case 'baidu':
      getBaiduSuggestion(keyword.value).then((res: any) => {
        suggestions.value = res[1];
      });
      break;
  }
  isOpenSuggestions.value = true;
}

const handleSuggestionClick = (index: number) => {
  // searchInput.value?.value = suggestions.value[index];
  isOpenSuggestions.value = false;
};

const getSearchEnginesIcon = (url: string) => {
  // https://www.google.com/s2/favicons?domain=xxx 
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
};

const startClock = () => {
  updateTime(); // 先立即刷新一次

  // 计算距离下一整秒的时间
  const msToNextSecond = 1000 - (new Date().getMilliseconds());

  // 第一次用 setTimeout 对齐整秒
  setTimeout(() => {
    updateTime();

    // 然后每秒刷新一次
    timer = window.setInterval(updateTime, 1000);
  }, msToNextSecond);
};

onMounted(() => {
  getBingWallpaper(bingWallpaperPage.value)
  getBingSuggestion('你好').then((res) => console.log(res));
  getBaiduSuggestion('你好').then((res) => console.log(res));
  // bingWallpaperRef.value?.showModal();
  bingUrlSuffix.value = '/th?id=OHR.EvergladesSunrise_ZH-CN2298606730_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp';
  startClock();
  nextTick(() => {
    if (timeBoxRef.value && searchBoxRef.value) {
      searchBoxRef.value.style.marginBottom = `${timeBoxRef.value.offsetHeight}px`;
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const height = entry.contentRect.height;
          searchBoxRef.value!.style.marginBottom = `${height}px`;
        }
      });
      resizeObserver.observe(timeBoxRef.value);
    }
    if (searchEngineRef.value) {
      document.addEventListener('click', handleClickOutside);
    }
  });
})

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped lang="scss">
.tab-main {
  width: 100%;
  height: 100vh;
  display: grid;
  place-items: center;
  background-image: v-bind(bingUrl);
  background-size: cover;
  background-position: 50%;
  overflow: hidden;
}

.options-box {
  position: fixed;
  top: 10px;
  right: 10px;

  button {
    padding: 4px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background-color: transparent;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    img {
      border-radius: 50%;
      object-fit: cover;
      width: 26px;
      height: 26px;
      opacity: 0.75;
    }
  }
}

.container {
  width: 37.5%;
  // min-width: 200px;
  min-width: 320px;
  max-width: 80vw;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 35px;
}

.time-box {
  color: #fff;
  text-align: center;
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.45),
    0 0 18px rgba(0, 0, 0, 0.25);

  .time {
    font-size: 4.8rem;
    font-weight: bold;
  }

  .date {
    font-size: 1rem;
    line-height: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
}

.search-box {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background-color: #fff;
  width: 100%;
  min-height: 50px;
  height: 6.5vh;
  border-radius: 50rem;
  // padding: 0 20px;
  position: relative;

  .select-engine {
    width: 62px;
    height: 100%;
    border-top-left-radius: 50rem;
    border-bottom-left-radius: 50rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 14px;

    &:hover {
      background-color: #f0f0f0;
    }

    .engine-icon {
      width: 28px;
      height: 28px;
    }

    .down-icon {
      width: 16px;
      height: 16px;
      opacity: 0.4;
    }
  }

  form {
    height: 100%;
    flex: 1;
    display: flex;
  }

  img {
    object-fit: cover;
  }

  .search-button {
    width: 60px;
    height: 100%;
    border-top-right-radius: 50rem;
    border-bottom-right-radius: 50rem;
    display: flex;
    align-items: center;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: #f0f0f0;
    }
  }
}

.search-icon {
  width: 24px;
  height: 24px;
  object-fit: cover;
  opacity: 0.75;
}

input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: transparent;
}

.engine-options {
  box-sizing: border-box;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  border-radius: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  padding: 1rem;
  margin-top: 0.5rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }

  li:hover {
    background-color: #f0f0f0;
  }

  .engine-icon {
    width: 28px;
    height: 28px;
  }

  .engine-name {
    font-size: 1rem;
  }

  .add-engine {
    border: 1px dashed rgba(0, 0, 0, 0.25);
  }
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  // display: flex;
  // flex-wrap: wrap;
  // gap: 0.5rem;

  border-radius: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  margin-top: 0.5rem;

  font-size: 0.875rem;

  li {
    // display: flex;
    // align-items: center;
    // gap: 0.5rem;
    cursor: pointer;
    // padding: 0.5rem 1rem;

    p {
      padding: 0.75rem 0.5rem 0.75rem 72px;
    }
  }

  li:first-child {
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }

  li:last-child {
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }

  li:hover {
    background-color: #f0f0f0;
  }
}
</style>
