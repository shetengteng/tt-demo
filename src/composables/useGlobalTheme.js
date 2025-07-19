import { ref, watch } from 'vue';

// 全局主题状态
export const globalDarkMode = ref(false);

// 应用主题的函数
const applyTheme = () => {
    if (globalDarkMode.value) {
        document.documentElement.classList.add('dark-theme');
    } else {
        document.documentElement.classList.remove('dark-theme');
    }
};

// 初始化主题
const initTheme = () => {
    const savedTheme = localStorage.getItem('darkMode');
    globalDarkMode.value = savedTheme === 'true';
    applyTheme();
};

// 立即初始化主题
initTheme();

// 监听全局主题状态变化
watch(globalDarkMode, (newValue) => {
    localStorage.setItem('darkMode', newValue.toString());
    applyTheme();
});

// 导出全局主题状态和方法
export const useGlobalTheme = () => {
    const toggleTheme = () => {
        globalDarkMode.value = !globalDarkMode.value;
    };

    const setTheme = (isDark) => {
        globalDarkMode.value = isDark;
    };

    return {
        darkMode: globalDarkMode,
        toggleTheme,
        setTheme
    };
}; 