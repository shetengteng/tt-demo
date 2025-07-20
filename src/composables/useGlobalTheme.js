import { ref, watch, computed } from 'vue';

// 全局主题状态
export const globalDarkMode = ref(false);

// 动画相关状态
export const themeAnimationState = ref({
  isAnimating: false,
  clickPosition: { x: 0, y: 0 },
  targetTheme: false,
  pendingThemeChange: false
});

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
    const toggleTheme = (event = null) => {
        // 记录点击位置
        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            themeAnimationState.value = {
                isAnimating: true,
                clickPosition: { x, y },
                targetTheme: !globalDarkMode.value,
                pendingThemeChange: true
            };
        } else {
            // 如果没有事件（直接调用），立即切换主题
            globalDarkMode.value = !globalDarkMode.value;
        }
    };

    const setTheme = (isDark, event = null) => {
        // 记录点击位置
        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            themeAnimationState.value = {
                isAnimating: true,
                clickPosition: { x, y },
                targetTheme: isDark,
                pendingThemeChange: true
            };
        } else {
            // 如果没有事件（直接调用），立即切换主题
            globalDarkMode.value = isDark;
        }
    };

    const completeAnimation = () => {
        // 动画结束后，立即执行待处理的主题切换
        if (themeAnimationState.value.pendingThemeChange) {
            globalDarkMode.value = themeAnimationState.value.targetTheme;
            themeAnimationState.value.pendingThemeChange = false;
        }
        themeAnimationState.value.isAnimating = false;
    };
    
    // 当前主题计算属性
    const currentTheme = computed(() => globalDarkMode.value ? 'dark' : 'light');

    return {
        darkMode: globalDarkMode,
        toggleTheme,
        setTheme,
        completeAnimation,
        currentTheme,
        themeAnimationState
    };
}; 