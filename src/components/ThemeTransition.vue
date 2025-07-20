<template>
  <div class="theme-transition-container">
    <div
      v-if="themeAnimationState.isAnimating"
      class="theme-transition-overlay"
      :style="overlayStyle"
      @animationend="onAnimationEnd"
    ></div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useGlobalTheme } from '../composables/useGlobalTheme'

  const { themeAnimationState, completeAnimation } = useGlobalTheme()

  const overlayStyle = computed(() => ({
    left: `${themeAnimationState.value.clickPosition.x}px`,
    top: `${themeAnimationState.value.clickPosition.y}px`,
    background: themeAnimationState.value.targetTheme
      ? 'radial-gradient(circle, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
      : 'radial-gradient(circle, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)',
    borderColor: themeAnimationState.value.targetTheme ? '#4a82f0' : '#ffd700',
  }))

  const onAnimationEnd = () => {
    // 动画完成后调用全局的completeAnimation方法
    completeAnimation()
  }
</script>

<style scoped>
  .theme-transition-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  }

  .theme-transition-overlay {
    position: absolute;
    width: 0;
    height: 0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: theme-transition 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)
      forwards;
    pointer-events: none;
    border: 3px solid;
    box-shadow: 0 0 40px rgba(74, 130, 240, 0.3);
  }

  @keyframes theme-transition {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
      transform: translate(-50%, -50%) scale(0);
      border-width: 3px;
      filter: brightness(1.2);
    }
    20% {
      opacity: 0.95;
      transform: translate(-50%, -50%) scale(0.3);
      border-width: 4px;
      filter: brightness(1.1);
    }
    50% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(0.7);
      border-width: 3px;
      filter: brightness(1);
    }
    80% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1);
      border-width: 2px;
      filter: brightness(0.9);
    }
    100% {
      width: 500vw;
      height: 500vw;
      opacity: 0;
      transform: translate(-50%, -50%) scale(1);
      border-width: 0px;
      filter: brightness(0.8);
    }
  }
</style>
