import { ref, onMounted } from 'vue';

export function useTheme() {
  const darkMode = ref(false);

  const applyTheme = () => {
    if (darkMode.value) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const toggleTheme = () => {
    darkMode.value = !darkMode.value;
    // 修复前：存储布尔值
    // 修复后：存储为字符串
    localStorage.setItem('darkMode', darkMode.value.toString());
    applyTheme();
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('darkMode');
    // 保持严格类型判断
    darkMode.value = savedTheme === 'true';
    applyTheme();
  });

  return {
    darkMode,
    toggleTheme
  };
}